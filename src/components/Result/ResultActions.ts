/**
 * Search actions
 */
import {ItemUUID, Repository} from "apisearch";
import {Query} from "apisearch";
import * as cloneDeep from "clone-deep";
import {APISEARCH_DISPATCHER} from "../../Constants";
import container from "../../Container";

/**
 *
 * Configure query
 *
 * @param environmentId
 * @param currentQuery
 * @param itemsPerPage
 * @param highlightsEnabled
 * @param suggestionsEnabled
 * @param promotedUUIDs
 * @param excludedUUIDs
 * @param fields
 * @param filter
 * @param minScore
 */
export function configureQuery(
    environmentId: string,
    currentQuery: Query,
    itemsPerPage: number,
    highlightsEnabled: boolean,
    suggestionsEnabled: boolean|number,
    promotedUUIDs: ItemUUID[],
    excludedUUIDs: ItemUUID[],
    fields: string[],
    filter: Function,
    minScore: number
) {
    const clonedQuery = cloneDeep(currentQuery);
    filter(clonedQuery);

    /**
     * Set result size
     */
    clonedQuery.size = itemsPerPage;

    /**
     * Set specific fields
     */
    clonedQuery.setFields(fields);

    /**
     * Enabling highlights on query result
     */
    if (highlightsEnabled) {
        clonedQuery.enableHighlights();
    }

    /**
     * Enabling highlights on query result
     */
    if (suggestionsEnabled) {
        clonedQuery.enableSuggestions();
        if (suggestionsEnabled == true) {
            clonedQuery.setMetadataValue('number_of_suggestions', null);
        } else if (suggestionsEnabled > 0) {
            clonedQuery.setMetadataValue('number_of_suggestions', suggestionsEnabled);
        }
    }

    /**
     * Promoted uuids
     */
    for (const i in promotedUUIDs) {
        clonedQuery.promoteUUID(promotedUUIDs[i]);
    }

    /**
     * excluded uuids
     */
    for (const i in excludedUUIDs) {
        clonedQuery.excludeUUID(excludedUUIDs[i]);
    }

    if (minScore > 0) {
        clonedQuery.minScore = minScore;
    }

    const dispatcher = container.get(`${APISEARCH_DISPATCHER}__${environmentId}`);
    dispatcher.dispatch({
        type: "UPDATE_APISEARCH_SETUP",
        payload: {
            query: clonedQuery,
        },
    });
}

/**
 * Pagination change
 *
 * @param environmentId
 * @param currentQuery
 * @param repository
 * @param nextPage
 */
export function infiniteScrollNextPageAction(
    environmentId: string,
    currentQuery: Query,
    repository: Repository,
    nextPage: number,
) {
    const clonedQuery = cloneDeep(currentQuery);
    clonedQuery.page = nextPage;
    const dispatcher = container.get(`${APISEARCH_DISPATCHER}__${environmentId}`);

    repository
        .query(clonedQuery)
        .then((result) => {
            dispatcher.dispatch({
                type: "RENDER_FETCHED_DATA",
                payload: {
                    query: clonedQuery,
                    result,
                },
            });
        })
        .catch((error) => {
            // Do nothing
        });
}
