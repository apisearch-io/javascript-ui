import {HttpRepository} from "apisearch";
import apisearch from "apisearch";
import ApisearchHelper from "./ApisearchHelper";
import ApisearchUIFactory from "./ApisearchUIFactory";
import {bootstrap} from "./Bootstrap";
import {APISEARCH_DISPATCHER, APISEARCH_UI} from "./Constants";
import container from "./Container";
import {createEnvironmentId} from "./Environment";
import Store from "./Store";
import Widget from "./widgets/Widget";
import widgets from "./widgets/Widgets";

/**
 * ApisearchUI class
 */
export default class ApisearchUI {

    public widgets: any;
    private readonly environmentId: string;
    private readonly repository: HttpRepository;
    private readonly store: Store;
    private readonly helper: ApisearchHelper;
    private activeWidgets: Widget[];
    private dictionary: { [key: string]: string; };
    private userId: string;
    private config: any;

    /**
     * Constructor
     *
     * @param environmentId
     * @param repository
     * @param store
     */
    public constructor(
        environmentId: string,
        repository: HttpRepository,
        store: Store,
    ) {
        /**
         * Environment Id
         */
        this.environmentId = environmentId;
        this.repository = repository;
        this.activeWidgets = [];
        this.widgets = widgets;
        this.helper = new ApisearchHelper();
        this.dictionary = {};

        /**
         * Store related properties
         */
        this.store = store;
    }

    /**
     * Initialize components
     *
     * @param firstQuery
     */
    public init({firstQuery = true} = {}) {

        this.activeWidgets.map((widget) => widget.withConfig(this.config));

        /**
         * 1.- Register all events on the store
         */
        this.store.on("render", () => this.render());
        this.store.on("toUrlObject", (query: any, object: any) => this.toUrlObject(query, object));
        this.store.on("fromUrlObject", (object: any, query: any) => this.fromUrlObject(object, query));

        /**
         * 2.- Trigger the initial render: (Mount the components)
         *     To let components setup its configuration on componentWillMount()
         */
        this.render();

        /**
         * 3.- Dispatch the initial data request
         *     With all widget previous initial configurations
         */
        if (
            typeof firstQuery === "undefined" ||
            true === firstQuery
        ) {
            this.store.fetchInitialQuery(
                this.environmentId,
                this.repository,
            );
        }

        window.dispatchEvent(new Event("apisearch_loaded", {
            bubbles: true,
        }));
    }

    /**
     * @param dictionary
     */
    public setDictionary(dictionary: { [key: string]: string; }) {
        this.dictionary = dictionary;
    }

    /**
     * Add new widget
     *
     * @param widget
     *
     * @return {ApisearchUI}
     */
    public addWidget(widget: Widget): ApisearchUI {
        console.log(this.config);
        widget.withConfig(this.config);
        this.activeWidgets = [...this.activeWidgets, widget];
        return this;
    }

    /**
     * Add components in bulk mode
     *
     * @param widgets
     *
     * @return {ApisearchUI}
     */
    public addWidgets(...widgets: Widget[]): ApisearchUI {
        widgets.map((widget) => this.addWidget(widget));
        return this;
    }

    /**
     * Render.
     *
     * Loop all active components
     * Hydrate them with new props
     * And render them.
     */
    public render() {
        this.activeWidgets.map((widget) => {
            widget.render(
                this.environmentId,
                this.store,
                this.repository,
                this.dictionary,
            );
        });
    }

    /**
     * @param query
     * @param object
     */
    public toUrlObject(
        query: any,
        object: any,
    ) {
        this.activeWidgets.map((widget) => {
            widget.toUrlObject(
                query,
                object,
            );
        });
    }

    /**
     * @param object
     * @param query
     */
    public fromUrlObject(
        object: any,
        query: any,
    ) {
        this.activeWidgets.map((widget) => {
            widget.fromUrlObject(
                object,
                query,
            );
        });
    }

    /**
     * Attach a function into an event
     *
     * @param eventName
     * @param action
     */
    public attach(
        eventName: string,
        action: any,
    ) {
        this
            .store
            .on(eventName, action);
    }

    /**
     * @param config
     * @param history
     *
     * @return {ApisearchUI}
     */
    public static create(
        config: any,
        history: boolean|string,
    ): ApisearchUI {

        apisearch.ensureRepositoryConfigIsValid(config);

        /**
         * Build environment Id
         */
        const environmentId = createEnvironmentId();

        /**
         * Bootstrapping ApisearchUI application
         */
        bootstrap(
            environmentId,
            config,
            history,
        );

        /**
         * Register handleActions method (store reducer)
         * into the event dispatcher
         */
        const apisearchUI = container.get(`${APISEARCH_UI}__${environmentId}`);
        const dispatcher = container.get(`${APISEARCH_DISPATCHER}__${environmentId}`);
        dispatcher.registerListener("RENDER_INITIAL_DATA", (payload) => apisearchUI.store.renderInitialData(payload));
        dispatcher.registerListener("RENDER_FETCHED_DATA", (payload) => apisearchUI.store.renderFetchedData(payload));
        dispatcher.registerListener("UPDATE_APISEARCH_SETUP", (payload) => apisearchUI.store.updateApisearchSetup(payload));

        /**
         * Add widgets
         */
        apisearchUI.widgets = widgets;
        apisearchUI.config = config;

        const uiId = `ui_${Math.ceil(Math.random() * (9999999 - 1) + 1)}`;
        apisearchUI.reference = uiId;
        apisearchUI.userId = config.user_id ?? "";
        window[uiId] = apisearchUI;

        /**
         * Return ApisearchUI instance
         */
        return apisearchUI;
    }

    /**
     * Create instance
     *
     * @param config
     *
     * @return {ApisearchUIFactory}
     */
    public static factory(config: any): ApisearchUIFactory{
        return ApisearchUIFactory.fromConfig(config);
    }

    /**
     * Click
     *
     * @param appId
     * @param indexId
     * @param itemId
     *
     * @return {any}
     */
    public click(
        appId: string,
        indexId: string,
        itemId: string,
    ) {
        this
            .repository
            .click(appId, indexId, itemId, this.userId);
    }
}
