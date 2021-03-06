"use strict";
exports.__esModule = true;
exports.simpleSearchAction = exports.initialSearchSetup = void 0;
var Constants_1 = require("../../Constants");
var Container_1 = require("../../Container");
var Clone_1 = require("../Clone");
/**
 * Initial Search
 *
 * @param environmentId
 * @param currentQuery
 * @param initialSearch
 * @param autocomplete
 * @param searchableFields
 */
function initialSearchSetup(environmentId, currentQuery, initialSearch, autocomplete, searchableFields) {
    var dispatcher = Container_1["default"].get(Constants_1.APISEARCH_DISPATCHER + "__" + environmentId);
    var clonedQuery = Clone_1["default"].object(currentQuery);
    clonedQuery.filters._query.values = [initialSearch];
    clonedQuery.page = 1;
    if (searchableFields.length > 0) {
        clonedQuery.searchableFields = searchableFields;
    }
    if (autocomplete) {
        clonedQuery.enableSuggestions();
        var metadata = clonedQuery.getMetadata();
        if (metadata.number_of_suggestions === undefined) {
            clonedQuery.setMetadataValue('number_of_suggestions', 1);
        }
    }
    dispatcher.dispatch("UPDATE_APISEARCH_SETUP", {
        query: clonedQuery
    });
}
exports.initialSearchSetup = initialSearchSetup;
/**
 * Search action
 *
 * @param environmentId
 * @param currentQuery
 * @param repository
 * @param queryText
 * @param visibleResults
 */
function simpleSearchAction(environmentId, currentQuery, repository, queryText, visibleResults) {
    var dispatcher = Container_1["default"].get(Constants_1.APISEARCH_DISPATCHER + "__" + environmentId);
    var clonedQuery = Clone_1["default"].object(currentQuery);
    clonedQuery.filters._query.values = [queryText];
    clonedQuery.page = 1;
    if (!visibleResults) {
        dispatcher.dispatch("RENDER_FETCHED_DATA", {
            query: clonedQuery,
            result: null,
            visibleResults: visibleResults
        });
        return;
    }
    repository
        .query(clonedQuery)
        .then(function (result) {
        dispatcher.dispatch("RENDER_FETCHED_DATA", {
            query: clonedQuery,
            result: result,
            visibleResults: visibleResults
        });
    })["catch"](function (error) {
        // Do nothing
    });
}
exports.simpleSearchAction = simpleSearchAction;
