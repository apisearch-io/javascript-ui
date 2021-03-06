import {Component, h} from 'preact';
import {SuggestionsFilterProps} from "./SuggestionsFilterProps";
import {SuggestionsFilterState} from "./SuggestionsFilterState";
import {defaultItemTemplate} from "./defaultTemplates";
import {enableSuggestions, onWordClickAction} from "./SuggestionsFilterActions";
import Template from "../Template";

/**
 * Suggestion Filter Component
 */
class SuggestionsFilterComponent extends Component<SuggestionsFilterProps, SuggestionsFilterState> {

    /**
     * Component will mount
     */
    componentWillMount() {

        this.setState(prevState => {
            return {
                words: []
            };
        });

        const props = this.props;
        const environmentId = props.environmentId;
        const currentQuery = props.store.getCurrentQuery();

        /**
         * Dispatch action
         */
        enableSuggestions(
            environmentId,
            currentQuery
        );
    }

    /**
     * Component will receive props
     *
     * @param props
     */
    componentWillReceiveProps(props) {

        this.setState(prevState => {
            return {
                words: props
                    .store
                    .getCurrentResult()
                    .getSuggestions()
            };
        });
    }

    /**
     * @param word
     */
    handleClick = (word) => {

        const props = this.props;

        /**
         * Dispatch action
         */
        onWordClickAction(
            props.environmentId,
            props.store.getCurrentQuery(),
            props.repository,
            word
        );
    };

    /**
     * Render
     *
     * @return {any}
     */
    render(props, state) {

        const currentSearch = props.store.getCurrentQuery().getQueryText();
        const currentSearchLength = currentSearch.length;
        const containerClassName = props.classNames.container;
        const topClassName = props.classNames.top;
        const itemsListClassName = props.classNames.itemsList;
        const itemClassName = props.classNames.item;

        const topTemplate = props.template.top;
        const itemTemplate = props.template.item;
        const that = this;


        return (
            <div className={`as-suggestions ${containerClassName}`}>
                <Template
                    template={topTemplate}
                    className={`as-suggestions__top ${topClassName}`}
                    dictionary={this.props.dictionary}
                />

                <div className={`as-suggestions__itemsList ${itemsListClassName}`}>
                    {state.words.map(word => {
                        const templateData = {
                            word: word,
                            highlightedWord: "<em>"+word.substr(0, currentSearchLength)+"</em>"+word.substr(currentSearchLength)
                        };

                        return (
                            <div
                                className={`as-suggestions__item ${itemClassName}`}
                                onClick={function(e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    that.handleClick(word);
                                }}
                            >
                                <Template
                                    template={itemTemplate}
                                    data={templateData}
                                    dictionary={this.props.dictionary}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

SuggestionsFilterComponent.defaultProps = {
    classNames: {
        container: '',
        top: '',
        itemsList: '',
        item: '',
    },
    template: {
        top: null,
        item: defaultItemTemplate,
    },
}

export default SuggestionsFilterComponent;
