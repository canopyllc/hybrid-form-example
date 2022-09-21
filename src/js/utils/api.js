import axios from 'axios';
import {isFunction, zipObject} from 'lodash';
import {orderChoices} from '@/js/enums/api';
import Changes from '@/js/utils/changes';
import {isString} from '@/js/utils/stringUtil';

/**
 * This wrapper class for axios is intended to be used everywhere we need to make API calls to our internal API. It makes
 * it so that you can make create and update requests without getting a Django CSRF token exception.
 *
 * To use the wrapper in Vuex do the following following in the created life-cycle hook:
 *
 * @example
 *   created() {
 *     let vm = this;
 *     vm.$store.api = new API(vm.csrfToken);
 *   }
 *
 * Then inside of an action in your Vuex store you can access it with `this.app`.
 *
 * @example
 *   this.api.get(context.state.peopleListUrl)
 *     .then(function(response) {
 *       console.log(response.data);
 *     })
 *     .catch(function (error) {
 *       console.error(error);
 *     });
 *
 */
export default class API {
  constructor(csrfToken) {
    if (!csrfToken || typeof csrfToken !== 'string') {
      throw new Error("You can't use the API object without passing the csrfToken when initializing the API object.");
    }
    let api = axios.create({
      /**
       * The follow is so axios formats querystring params the way that Django expects them to be formatted. This is mainly
       * for when you have param that has multiple values. Without this function they would be formatted like
       * `?category[]=1&category[]=2`, when what we want is, `?category=1&category=2`.
       *
       * The following was copied from https://stackoverflow.com/a/52487821/176611
       */
      paramsSerializer(params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, param]) => {
          if (Array.isArray(param)) {
            param.forEach((p) => {
              searchParams.append(key, p);
            });
          } else {
            searchParams.append(key, param);
          }
        });
        return searchParams.toString();
      },
    });

    api.csrfToken = csrfToken;
    api.cancelToken = axios.CancelToken;
    api.isCancel = axios.isCancel;
    api.interceptors.request.use((config) => API.requestInterceptors(config, csrfToken), (error) => Promise.reject(error));
    api.interceptors.response.use(API.responseInterceptors, (error) => Promise.reject(error));

    api.getCritical = (url, config) => api.get(url, {...config, critical: true});

    api.getAllJSONResults = async (url, config = {}, results = []) => {
      /* eslint-disable no-param-reassign */
      config.params = {...config.params || {}, page_size: Number.MAX_SAFE_INTEGER};
      const rtnVal = await api.get(url, config).then(({data}) => {
        if (data.next === undefined || Array.isArray(data.results) === false) {
          throw TypeError(`Expected pagination to return a dictionary with the keys 'next' and 'results' where
         'next' has a value that is a url and 'results' has a value that is an array of objects.`);
        }
        results = [...results, ...data.results];
        if (data.next === null) {
          return {data: {...data, results}};
        }
        return api.getAllJSONResults(data.next, config, results);
      });
      return rtnVal;
    };

    return api;
  }

  /**
   * Checks if a request must resolve
   * @param {AxiosRequestConfig} config An Axios Request configuration
   * @returns {boolean|*|boolean} returns True if a request must resolve, false otherwise
   */
  static requestMustResolve(config) {
    const isMutatingRequest = /^(POST|PATCH|PUT|DELETE)$/i.test(config.method),
          isCriticalGet = config.method === 'GET' && config.critical;
    return isMutatingRequest || isCriticalGet;
  }

  /**
   * this function setups up all of our request interceptors for our custom axios config
   * add new request intercept logic here
   * @param {AxiosResponse} response A request config to intercept
   * @returns {AxiosResponse} Returns the modified request configuration
   */
  static responseInterceptors(response) {
    if (API.requestMustResolve(response.config)) {
      Changes.decrementInFlight();
    }
    return response;
  }

  /**
   * this function setups up all of our request interceptors for our custom axios config
   * add new request intercept logic here
   * @param {AxiosRequestConfig} config A request config to intercept
   * @param {String} csrfToken the csrfToken
   * @returns {AxiosRequestConfig} Returns the modified request configuration
   */
  static requestInterceptors(config, csrfToken) {
    // Setup for unsaved changes check
    if (API.requestMustResolve(config)) {
      Changes.incrementInFlight();
    }
    // Setup csrfToken
    if (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(config.method) === false) {
      config.headers[config.method] = {'X-CSRFToken': csrfToken};
    }
    return config;
  }
}

/**
 * This is the preferred method to analyze and parse API error responses for forms
 * @param {Error} error
 * @param {Boolean} isNetworkError true = error from api; false = errors from page load
 * @return {{formFieldErrors: {}, formAlertMessages: [*]}}
 */
export function parseFormErrorsGeneric(error, isNetworkError = true) {
  error = error === null ? {} : error;
  if (!error.response && isNetworkError) {
    return {formFieldErrors: {}, formAlertMessages: [error.message]};
  }
  const {data} = error.response || {data: error};
  let formFieldErrors = {},
      formAlertMessages = [];

  /**
   * Value should ALWAYS be an array here:
   * {
   *   "field": ["Error1", "Error2"],
   *   "non_field_errors": ["Error"],
   * }
   *
   * If it is not someone did it wrong and this should break.
   * @see PEARS-4717 PR
   */
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'non_field_errors') {
      value.forEach((errorMsg) => {
        formAlertMessages.push({message: errorMsg, type: 'error'});
      });
    } else {
      formFieldErrors[key] = value;
      if (value[0] === 'Invalid hyperlink - Object does not exist.') {
        formFieldErrors[key] = ['This field is required.'];
      }
    }
  });

  return {formFieldErrors, formAlertMessages};
}

export function objectToFormData(objectData) {
  return Object.entries(objectData)
    .reduce((formData, [key, value]) => {
      formData.append(key, value);
      return formData;
    }, (new FormData()));
}

/**
 * Transforms the results from an HTTP Response from an Array into an Object
 * where the id of the item is used as the key and the object is used as the value.
 * @param arrayList {Array[{Object}]} A list of results, usually returned from a  GET Request
 * @param idKey {String|Function} The id key you want to use, default is id, but if you need a different id, specify that here
 * @returns {Object} A map of results keyed by id.
 */
export function keyById(arrayList, idKey = 'id') {
  if (Array.isArray(arrayList) === false) {
    throw new Error(`Expected an Array, but got ${typeof arrayList}`);
  }

  return arrayList.reduce((prevValue, currentValue) => ({
    ...prevValue,
    [isFunction(idKey) ? idKey(currentValue) : currentValue[idKey]]: {...currentValue},
  }), {});
}

/**
 * Handles the logic for resolving a list of API Request. Use when you need to await a list
 * of promises
 * @param promises {Promise[]} An array of Promises that need to be settled
 * @param keys {String|Number[]} an array of keys to be used to group errors
 * @returns {Promise<{results:[], errors: []}>} returns an object split into an array of results an array of errors
 */
export async function resolveNetworkRequests(promises, keys) {
  const responses = await Promise.allSettled(promises),
        // Reduces the data from settled promises into one of two arrays based on their status
        settledPromisesReducer = (promiseData, [key, response]) => {
          if (response.status === 'rejected') {
            return {
              ...promiseData,
              errors: [...promiseData.errors, {[key]: response.reason}],
            };
          }
          return {
            ...promiseData,
            results: [...promiseData.results, response.value.data],
          };
        },
        // TODO: can we replace zipObject?
        zippedResponse = zipObject(keys, responses);
  return Object.entries(zippedResponse).reduce(settledPromisesReducer, {results: [], errors: []});
}

export function objectToURLSearchParams(objectData) {
  return Object.entries(objectData)
    .reduce((params, [key, value]) => {
      params.append(key, value);
      return params;
    }, (new URLSearchParams()));
}

/**
 * Reorder a list between two given indexes
 *
 * The ordering is based on an "order" prop
 * This function was written for draggable reordering. Mostly used in vuex for ordering to make backend calls
 *
 * Usage:
 * <draggable @change="reorderBetween($event, $event.moved.newIndex, $event.moved.oldIndex)">...</draggable>
 * ^ note don't copy verbatim, just an idea of how event matches to params
 *
 * @param items
 * @param index1
 * @param index2
 * @return {*}
 */
export function reorderBetween(items, index1, index2) {
  let min = index1,
      max = index2,
      updatedList = items.map((item) => ({...item})); // in case item is not an object, basically just prevents exception on .order access later

  if (index1 === undefined || index2 === undefined) {
    min = 0;
    max = updatedList.length - 1;
  } else if (index2 < index1) {
    min = index2;
    max = index1;
  }
  for (let i = min; i <= max; i++) {
    updatedList[i].order = i;
  }

  return updatedList;
}

/**
 * django filters is in form &ordering=[-]field_name
 * where presence of '-' indicates DESC order
 * @see orderChoices
 * @param orderByString - https://stackoverflow.com/a/9834153
 * @return {{orderBy: String, orderDir: String}}
 */
export function djangoFilterOrderingDeserialize(orderByString) {
  const isOrderDesc = orderByString.charAt(0) === '-',
        orderBy = isOrderDesc ? orderByString.slice(1) : orderByString,
        orderDir = isOrderDesc ? orderChoices.DESC : orderChoices.ASC;
  return {orderBy, orderDir};
}

export function djangoFilterOrderingSerialize({orderBy, orderDir}) {
  return `${orderDir === orderChoices.DESC ? '-' : ''}${orderBy}`;
}

// an item is persisted if the id is a string
export function isPersisted({id}) {
  return !isString(id);
}
