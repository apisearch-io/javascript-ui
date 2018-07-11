import { h, Component } from 'preact';

import * as cloneDeep from 'clone-deep';
import { aggregationSetup, filterAction } from "./MultipleFilterActions";
import { manageCurrentFilterItems } from "./Helpers";

import Template from "../Template";
import ShowMoreComponent from "./ShowMoreComponent";
import {defaultItemTemplate} from "./defaultTemplates";
import {MultipleFilterProps} from "./MultipleFilterProps";
import {MultipleFilterState} from "./MultipleFilterState";
import {Counter} from 'apisearch';
import {ResultAggregation} from 'apisearch';

/**
 * Filter Component
 */
class MultipleFilterComponent extends Component<MultipleFilterProps, MultipleFilterState> {

    /**
     * Constructor
     */
    constructor() {
        super();
        this.state = {
            viewLimit: 0,
            activeAggregations: [],
            currentAggregations: []
        }
    }

    /**
     * Components will mount
     */
    componentWillMount() {

        const props = this.props;
        const environmentId = props.environmentId;
        const filterName = props.filterName;
        const filterField = props.filterField;
        const aggregationField = props.aggregationField;
        const applicationType = props.applicationType;
        const sortBy = props.sortBy;
        const fetchLimit = props.fetchLimit;
        const viewLimit = props.viewLimit;
        const currentQuery = props.currentQuery;

        /**
         * Set view items limit
         */
        const isViewLimitProperlySet = (viewLimit && viewLimit < fetchLimit);
        this.setState({
            viewLimit: (isViewLimitProperlySet)
                ? viewLimit
                : fetchLimit
        });

        /**
         * Dispatch action
         */
        aggregationSetup(
            environmentId,
            currentQuery,
            filterName,
            (
                aggregationField
                    ? aggregationField
                    : filterField
            ),
            applicationType,
            sortBy,
            fetchLimit
        );
    }

    /**
     * Component will recieve props
     *
     * @param props
     */
    componentWillReceiveProps(props) {

        const filterName = props.filterName;
        const aggregation = props.currentResult.getAggregation(filterName);

        if (typeof aggregation.getCounters === "function") {

            /**
             * Getting aggregation from aggregations
             */
            let counters = aggregation.getCounters();
            let countersAsArray:Counter[] = Object.values(counters);

            this.setState({
                /**
                 * Current used aggregations
                 */
                activeAggregations: countersAsArray.filter(
                    counter =>
                        true === counter.isUsed()
                ),
                /**
                 * Current inactive aggregations
                 */
                currentAggregations: countersAsArray.filter(
                    counter =>
                        (
                            false === counter.isUsed() ||
                            null === counter.isUsed()
                        )
                )
            })
        }
    }

    /**
     * Handle click
     *
     * @param selectedFilter
     */
    handleClick = (selectedFilter) => {

        const props = this.props;
        const environmentId = props.environmentId;
        const filterName = props.filterName;
        const filterField = props.filterField;
        const aggregationField = props.aggregationField;
        const applicationType = props.applicationType;
        const sortBy = props.sortBy;
        const fetchLimit = props.fetchLimit;
        const repository = props.repository;
        const currentQuery = props.currentQuery;
        const aggregation = props.currentResult.getAggregation(filterName);
        const selectedFilterAsString = String(selectedFilter);
        const currentActiveFilterValues = aggregation instanceof ResultAggregation
            ? Object.values(aggregation.getActiveElements())
            : [];

        const valuesAsString = currentActiveFilterValues.map(element => {
            return String(element);
        });

        /**
         * Dispatch filter action
         */
        filterAction(
            environmentId,
            currentQuery,
            repository,
            filterName,
            filterField,
            (
                aggregationField
                    ? aggregationField
                    : filterField
            ),
            manageCurrentFilterItems(
                selectedFilterAsString,
                valuesAsString
            ),
            applicationType,
            sortBy,
            fetchLimit
        );
    };

    /**
     * Handle show more
     */
    handleShowMore = () => {

        const activeAggregations = this.state.activeAggregations;
        const currentAggregations = this.state.currentAggregations;
        const viewLimit = activeAggregations.length + currentAggregations.length;

        this.setState({viewLimit});
    };

    /**
     * Handle show less
     */
    handleShowLess = () => {
        const viewLimit = this.props.viewLimit;
        this.setState({viewLimit});
    };

    /**
     * Render
     *
     * @return {any}
     */
    render() {

        const props = this.props;
        const viewLimit = props.viewLimit;
        const fetchLimit = props.fetchLimit;

        const containerClassName = props.classNames.container;
        const topClassName = props.classNames.top;
        const itemsListClassName = props.classNames.itemsList;
        const itemClassName = props.classNames.item;
        const activeClassName = props.classNames.active;
        const showMoreContainerClassName = props.classNames.showMoreContainer;

        const topTemplate = props.template.top;
        const itemTemplate = props.template.item;
        const showMoreTemplate = props.template.showMore;
        const showLessTemplate = props.template.showLess;

        const formatData = props.formatData;

        /**
         * Get aggregation items
         */
        const allItems = [
            ...this.state.activeAggregations,
            ...this.state.currentAggregations
        ];
        const allItemsLength = allItems.length;
        const items = allItems.slice(0, this.state.viewLimit);

        /**
         * Check available view limit
         */
        const isViewLimitProperlySet = (viewLimit && viewLimit < fetchLimit);

        return (
            <div className={`as-multipleFilter ${containerClassName}`}>
                <Template
                    template={topTemplate}
                    className={`as-multipleFilter__top ${topClassName}`}
                />

                <div className={`as-multipleFilter__itemsList ${itemsListClassName}`}>
                {items.map(item => {
                    const reducedTemplateData = {
                        n: item.getN(),
                        isActive: item.isUsed(),
                        values: item.getValues()
                    };
                    const formattedTemplateData = formatData(reducedTemplateData);
                    return (
                        <div
                            className={
                                `as-multipleFilter__item ` +
                                `${itemClassName} ` +
                                `${(item.used) ? activeClassName : ''}`
                            }
                            onClick={() => this.handleClick(item.values.id)}
                        >
                            <Template
                                template={itemTemplate}
                                data={formattedTemplateData}
                            />
                        </div>
                    )
                })}
                </div>

                {(isViewLimitProperlySet)
                    ? <ShowMoreComponent
                        allItemsLength={allItemsLength}
                        currentLimit={this.state.viewLimit}
                        handleShowMore={this.handleShowMore}
                        handleShowLess={this.handleShowLess}
                        showMoreContainerClassName={showMoreContainerClassName}
                        showMoreTemplate={showMoreTemplate}
                        showLessTemplate={showLessTemplate}
                    /> : null
                }
            </div>
        )
    }
}

MultipleFilterComponent.defaultProps = {
    aggregationField: null,
    applicationType: 8, // FILTER_MUST_ALL
    fetchLimit: 10,
    viewLimit: null,
    sortBy: ['_term', 'desc'],
    classNames: {
        container: '',
        top: '',
        itemsList: '',
        item: '',
        active: 'as-multipleFilter__item--active',
        showMoreContainer: ''
    },
    template: {
        top: null,
        item: defaultItemTemplate,
        showMore: '+ Show more',
        showLess: '- Show less'
    },
    formatData: data => data
};

export default MultipleFilterComponent;