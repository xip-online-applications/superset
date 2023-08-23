# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import logging
from abc import ABC
from typing import Any, cast, Optional

import simplejson as json
from flask import request
from flask_babel import lazy_gettext as _
from sqlalchemy.exc import SQLAlchemyError

from superset import db
from superset.commands.base import BaseCommand
from superset.connectors.base.models import BaseDatasource
from superset.connectors.sqla.models import SqlaTable
from superset.daos.datasource import DatasourceDAO
from superset.daos.exceptions import DatasourceNotFound
from superset.exceptions import SupersetException
from superset.explore.commands.parameters import CommandParameters
from superset.explore.exceptions import WrongEndpointError
from superset.explore.form_data.commands.get import GetFormDataCommand
from superset.explore.form_data.commands.parameters import (
    CommandParameters as FormDataCommandParameters,
)
from superset.explore.permalink.commands.get import GetExplorePermalinkCommand
from superset.explore.permalink.exceptions import ExplorePermalinkGetFailedError
from superset.utils import core as utils
from superset.views.utils import (
    get_datasource_info,
    get_form_data,
    sanitize_datasource_data,
)

logger = logging.getLogger(__name__)


class GetExploreCommand(BaseCommand, ABC):
    def __init__(
        self,
        params: CommandParameters,
    ) -> None:
        self._permalink_key = params.permalink_key
        self._form_data_key = params.form_data_key
        self._slice_id = params.slice_id

    # pylint: disable=too-many-locals,too-many-branches,too-many-statements
    def run(self) -> Optional[dict[str, Any]]:
        initial_form_data = {}

        if self._permalink_key is not None:
            command = GetExplorePermalinkCommand(self._permalink_key)
            permalink_value = command.run()
            if not permalink_value:
                raise ExplorePermalinkGetFailedError()
            state = permalink_value["state"]
            initial_form_data = state["formData"]
            url_params = state.get("urlParams")
            if url_params:
                initial_form_data["url_params"] = dict(url_params)
        elif self._form_data_key:
            parameters = FormDataCommandParameters(key=self._form_data_key)
            value = GetFormDataCommand(parameters).run()
            initial_form_data = json.loads(value) if value else {}

        message = None

        if not initial_form_data:
            if self._slice_id:
                initial_form_data["slice_id"] = self._slice_id
                if self._form_data_key:
                    message = _(
                        "Form data not found in cache, reverting to chart metadata."
                    )

        form_data, slc = get_form_data(
            slice_id=self._slice_id,
            use_slice_data=True,
            initial_form_data=initial_form_data,
        )
        # On explore, merge legacy/extra filters and URL params into the form data
        utils.convert_legacy_filters_into_adhoc(form_data)
        utils.merge_extra_filters(form_data)
        utils.merge_request_params(form_data, request.args)

        metadata = None

        return {
            "form_data": form_data,
            "slice": slc.data if slc else None,
            "message": message,
            "metadata": metadata,
        }

    def validate(self) -> None:
        pass
