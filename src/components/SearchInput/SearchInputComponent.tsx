import {h, Component} from 'preact';
import {simpleSearchAction, initialSearchSetup} from "./SearchInputActions";
import Template from "../Template";
import {SearchInputProps} from "./SearchInputProps";
import {SearchInputState} from "./SearchInputState";
import AutocompleteComponent from "./AutocompleteComponent";
import {useRef} from "preact/compat";

/**
 * SearchInput Component
 */
class SearchInputComponent extends Component<SearchInputProps, SearchInputState> {
    private inputRef = useRef(null);
    private speechRecognition;

    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        if (props.autocomplete) {
            this.state = { queryText: '' };
        }

        const that = this;
        const speechRecognition = window['webkitSpeechRecognition'];
        if (props.speechRecognition && typeof speechRecognition === "function") {
            this.speechRecognition = new speechRecognition();
            this.speechRecognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                this.handleSearch(text);
            }

            this.speechRecognition.onspeechend = function() {
                that.speechRecognition.stop();
            }
        }
    }

    /**
     * Components will mount
     */
    componentWillMount() {

        const props = this.props;
        const environmentId = props.environmentId;
        const initialSearch = props.initialSearch;
        const currentQuery = props.store.getCurrentQuery();
        const autocomplete = props.autocomplete;
        const searchableFields = props.searchableFields;

        /**
         * Dispatch action
         */
        initialSearchSetup(
            environmentId,
            currentQuery,
            initialSearch,
            autocomplete,
            searchableFields
        );
    }

    /**
     * Component will receive props
     *
     * @param props
     */
    componentWillReceiveProps(props) {
        this.setState({
            queryText: props.store.getCurrentQuery().getQueryText()
        });
    }

    /**
     * @param search
     */
    handleSearch = (search) => {
        const props = this.props;
        const startSearchOn = props.startSearchOn;
        const environmentId = props.environmentId;
        const currentQuery = props.store.getCurrentQuery();
        const repository = props.repository;
        const visibleResults = search.length >= startSearchOn;

        simpleSearchAction(
            environmentId,
            currentQuery,
            repository,
            search,
            visibleResults
        );
    }

    /**
     * Clear search
     */
    clearSearch = () => {

        const props = this.props;
        const startSearchOn = props.startSearchOn;
        const environmentId = props.environmentId;
        const currentQuery = props.store.getCurrentQuery();
        const repository = props.repository;
        const visibleResults = 0 == startSearchOn;

        simpleSearchAction(
            environmentId,
            currentQuery,
            repository,
            '',
            visibleResults
        )
    };

    /**
     * Key down
     */
    handleKeyDown(e) {

        switch (e.keyCode) {
            case 39:
            case 9:
                const props = this.props;
                const environmentId = props.environmentId;
                const currentQuery = props.store.getCurrentQuery();
                const repository = props.repository;

                if (this.props.store.getCurrentResult().getSuggestions().length > 0) {
                    simpleSearchAction(
                        environmentId,
                        currentQuery,
                        repository,
                        this.props.store.getCurrentResult().getSuggestions()[0],
                        true,
                    );

                    e.preventDefault();
                    return;
                }

                break;
        }
    }

    onSpeechMouseDown(e, speechRecognition) {
        speechRecognition.start();
    }

    onSpeechMouseUp(e, speechRecognition) {
        speechRecognition.stop();
    }

    doNothing(e) {}

    withConfig(config: any) {
        if (this.speechRecognition) {
            this.speechRecognition.lang = this.props.config.options.locale ?? '';
        }
    }

    /**
     * Search
     *
     * @return {any}
     */
    render() {

        const props = this.props;
        const placeholder = props.placeholder;
        const autofocus = props.autofocus;
        const clearSearch = props.clearSearch;
        const withContainer = props.withContainer;
        const containerClassName = props.classNames.container;
        const inputClassName = props.classNames.input;
        const clearSearchClassName = props.classNames.clearSearch;
        const clearSearchTemplate = props.template.clearSearch;
        const currentQueryText = props.store.getCurrentQuery().getQueryText();
        const htmlNodeInheritProps = props.htmlNodeInheritProps;
        const suggestions = props.store.getCurrentResult()
            ? props.store.getCurrentResult().getSuggestions()
            : [];

        const showAutocomplete = props.autocomplete;

        const keyDownCallback = showAutocomplete
            ? (e) => this.handleKeyDown(e)
            : (e) => this.doNothing(e);

        const style = showAutocomplete
            ? 'position: relative; top: 0px; left: 0px; background-color: transparent; border-color: transparent;'
            : '';

        let searchInput = (<input
            type='text'
            className={`as-searchInput__input ${inputClassName}`}
            placeholder={placeholder}
            autofocus={autofocus}
            {...htmlNodeInheritProps}
            onInput={(event) => this.handleSearch((event.target as HTMLInputElement).value)}
            value={currentQueryText}
            style={style}
            onKeyDown={keyDownCallback}
            ref={this.inputRef}
        />)

        if (showAutocomplete) {
            searchInput = (
                <div style="position: relative">
                    <AutocompleteComponent
                      suggestions={suggestions}
                      queryText={currentQueryText}
                      inputClassName={inputClassName}
                    />
                    {searchInput}
                </div>
            )
        }

        if (this.speechRecognition) {
            searchInput = (
                <div style="position: relative">
                    {searchInput}
                    <div
                        class={`as-searchInput-speechRecognition`}
                        onMouseDown={(e) => this.onSpeechMouseDown(e, this.speechRecognition)}
                    >
                        <Template
                            template={props.template.speechRecognition}
                            dictionary={props.dictionary}
                        />
                    </div>
                </div>
            )
        }

        if (withContainer) {
            searchInput = (
                <div className={`as-searchInput ${containerClassName}`}>
                    {searchInput}

                    {(clearSearch && currentQueryText && currentQueryText.length !== 0)
                        ? (
                            <div
                                className={`as-searchInput__clearSearch ${clearSearchClassName}`}
                                onClick={this.clearSearch}
                            >
                                <Template
                                    template={clearSearchTemplate}
                                    dictionary={props.dictionary}
                                />
                            </div>
                        ) : null
                    }
                </div>
            )
        }

        return searchInput;
    }
}

SearchInputComponent.defaultProps = {
    placeholder: '',
    autofocus: false,
    autocomplete: false,
    startSearchOn: 0,
    clearSearch: true,
    initialSearch: '',
    withContainer: true,
    searchableFields: [],
    speechRecognition: false,
    classNames: {
        container: '',
        input: '',
        clearSearch: ''
    },
    template: {
        clearSearch: 'x',
        speechRecognition: '{S}'
    },
};

export default SearchInputComponent;
