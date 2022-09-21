import {throttle} from 'lodash';
import API from '../utils/api';

/**
 * This mixin defines behavior common to various searchable components (i.e. the checkbox lists and select inputs)
 */

export default {
  data() {
    return {
      /**
       * List of modifiable options used for display purposes
       */
      localOptions: [],
      /**
       * The string that the user wants to search for
       */
      searchText: '',
      inFlight: false,
      request: {},
      api: null,
    };
  },
  inject: ['csrfToken', 'urls'],
  props: {
    /**
     * Enable/disable filtering/searching the options.
     * @type {Boolean}
     */
    searchable: {
      type: Boolean,
      default: true,
    },
    /**
     * An array of strings or objects to be used as dropdown choices.
     * @type {Array}
     */
    options: {
      type: Array,
      default: () => [],
    },
    /**
     * Indicates this is an Ajax select field. Uses the URL to retrieve options
     * MUST BE A RELATIVE LINK
     * @type {String}
     */
    optionsUrl: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Used when searching to determine if search term matches item
     * @todo ONLY USED IN CHECKBOX LIST ATM... consider moving logic out of mixin
     */
    displayName: {
      type: String,
      default: 'display_name',
    },
    clearAfterSearch: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['clear', 'error', 'search:results'],
  computed: {
    hasQuery() {
      return this.searchText !== '';
    },
    noOptionsText() {
      let rtnVal = 'Sorry, no matching options.';
      if (this.optionsUrl) {
        rtnVal = 'Type to search ...';
      }
      return rtnVal;
    },
    optionKeys() {
      return this.options.map((opt) => opt[this.optionValue]);
    },
  },
  mounted() {
    this.api = new API(this.csrfToken);
  },
  watch: {
    options: {
      immediate: true,
      handler: 'resetOptions',
    },
    searchText: throttle(async function() {
      if (this.hasQuery === false) {
        this.resetOptions();
        return;
      }

      // Ajax Search
      if (this.optionsUrl !== '') {
        if (this.inFlight === true && this.request !== null) {
          await this.request.cancel();
        }
        this.inFlight = true;
        this.request = this.api.cancelToken.source();
        try {
          // utilize new URL API
          // @see https://developer.mozilla.org/en-US/docs/Web/API/URL_API
          let url = this.optionsUrl.startsWith('http')
            ? new URL(this.optionsUrl)
            : new URL(this.optionsUrl, document.location.origin),
              params = {
                q: this.searchText, page_size: 20, idformat: 1, ...Object.fromEntries(url.searchParams),
              },
              response = await this.api.get(url.pathname, {cancelToken: this.request.token, params});
          this.inFlight = false;

          // Could be an API endpoint in itself or from filter field config
          const results = this.hasQuery ? response.data.results || response.data.params.options : [];
          this.localOptions = [
            ...results.filter((item) => !this.optionKeys.includes(item[this.optionValue])),
            ...this.options,
          ];
          this.$emit('search:results', this.localOptions);
        } catch (error) {
          if (!this.api.isCancel(error)) {
            this.$emit('error', error);
          }
        }
      } else {
        /**
         * This fuzzy search method is VERY naive and could be improved to:
         * @see https://github.com/farzher/fuzzysort
         * @todo ONLY USED IN CHECKBOX LIST ATM... consider moving logic out of mixin - maybe a callback here or something
         */
        this.localOptions = this.options.filter((item) => item[this.displayName].toLowerCase().startsWith(this.searchText.toLowerCase()));
      }
    }, 600),
  },
  methods: {
    resetOptions() {
      if (this.searchText !== '' && this.clearAfterSearch === true) { // avoid infinite loop from watcher on searchText
        this.localOptions = this.options;
        this.searchText = ''; // reset the search if options get reset outside of ajax search loop
      } else if (this.searchText === '') {
        this.localOptions = this.options;
      }
    },
    clearSearch() {
      this.localOptions = this.options;
      this.searchText = '';
    },
    clearSelection() {
      this.resetOptions();
      this.$emit('clear'); // this fires mutation that fires off new api requests
    },
  },
};
