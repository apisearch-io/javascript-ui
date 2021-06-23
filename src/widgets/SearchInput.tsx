import { h, render } from 'preact';
import SearchInputComponent from "../components/SearchInput/SearchInputComponent";
import Widget from "./Widget";
import {Repository} from "apisearch";
import Store from "../Store";

/**
 * SearchInput
 */
class SearchInput extends Widget{

    private targetNode: any;
    private isSecondRender: boolean;

    /**
     * Constructor
     *
     * @param target
     * @param placeholder
     * @param startSearchOn
     * @param clearSearch
     * @param withContainer
     * @param autofocus
     * @param autocomplete
     * @param classNames
     * @param template
     * @param initialSearch
     * @param searchableFields
     * @param speechRecognition
     */
    constructor({
        target,
        placeholder,
        startSearchOn,
        clearSearch,
        withContainer,
        autofocus,
        autocomplete,
        classNames,
        template,
        initialSearch,
        searchableFields,
        speechRecognition
    }) {
        super();
        this.target = target;
        this.component = <SearchInputComponent
            target={target}
            placeholder={placeholder}
            autofocus={autofocus}
            autocomplete={autocomplete}
            startSearchOn={startSearchOn}
            clearSearch={clearSearch}
            withContainer={withContainer}
            searchableFields={searchableFields}
            speechRecognition={speechRecognition}
            classNames={{
                ...SearchInputComponent.defaultProps.classNames,
                ...classNames
            }}
            template={{
                ...SearchInputComponent.defaultProps.template,
                ...template
            }}
            initialSearch={initialSearch}
            config={this.config}
        />
    }

    /**
     * @param environmentId
     * @param store
     * @param repository
     * @param dictionary
     */
    public render(
        environmentId: string,
        store: Store,
        repository: Repository,
        dictionary: { [key: string]: string; }
    ) {
        this.component.props = {
            ...this.component.props,
            environmentId: environmentId,
            repository: repository,
            store: store,
            htmlNodeInheritProps: {
                autocomplete: 'off',
                spellcheck: false
            },
            dictionary: dictionary,
        };

        if (!this.targetNode) {
            const targetNode = document.querySelector(this.target)
            const isInput = isInputElement(targetNode);

            if (isInput) {
                this.component.props = {
                    ...this.component.props,
                    withContainer: false,
                    htmlNodeInheritProps: {
                        ...this.component.props.htmlNodeInheritedProps,
                        ...getNodeAttributes(targetNode)
                    }
                };

                const parentNode = targetNode.parentNode;
                targetNode.remove();
                this.targetNode = parentNode;
            } else {
                this.targetNode = targetNode;
            }
        }

        if (this.isSecondRender == undefined) {
            this.isSecondRender = true;
        } else if (this.isSecondRender == true) {
            this.isSecondRender = false;
        }

        render(
            this.component,
            this.targetNode
        )
    }

    /**
     * @param query
     * @param object
     */
    public toUrlObject(
        query: any,
        object: any
    )
    {
        const q = query.q;
        if (
            q !== undefined &&
            q !== ''
        ) {
            object.q = q;
        }
    }

    /**
     * @param object
     * @param query
     */
    public fromUrlObject(
        object: any,
        query: any
    )
    {
        const q = object.q;
        if (
            q !== undefined &&
            q !== ''
        ) {
            query.q = q;
        }
    }
}

/**
 * Returns an object of an
 * html node attributes.
 *
 * @param htmlNode
 * @returns {{}}
 */
const getNodeAttributes = (htmlNode) => {
    let nodeAttributes = {};
    for (let i = 0; i < htmlNode.attributes.length; i++) {
        let attr = htmlNode.attributes[i];
        if (attr.specified) {
            nodeAttributes = {
                ...nodeAttributes,
                [attr.name]: attr.value
            }
        }
    }

    return nodeAttributes;
};

/**
 * Checks if an html node
 * is an input.
 *
 * @param targetNode
 * @returns {boolean}
 */
const isInputElement = (targetNode) => {
    return targetNode instanceof HTMLInputElement;
};

/**
 * Search Input widget
 *
 * @param settings
 */
export default settings => new SearchInput(settings);
