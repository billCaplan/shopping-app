import { ActionTree } from "vuex"
import { quickSearchByQuery } from '@vue-storefront/store/lib/search'
import * as types from './mutation-types'
import SearchQuery from '@vue-storefront/store/lib/search/searchQuery'
import RootState from '@vue-storefront/store/types/RootState';
import CmsPageState from "../../types/CmsPageState"
import { cacheStorage  } from '../../'
import { cmsPagesStorageKey } from './'

const actions: ActionTree<CmsPageState, RootState> = {

  /**
   * Retrieve cms pages
   *
   * @param context
   * @param {any} filterValues
   * @param {any} filterField
   * @param {any} size
   * @param {any} start
   * @param {any} excludeFields
   * @param {any} includeFields
   * @returns {Promise<T> & Promise<any>}
   */
  list (context, { filterValues = null, filterField = 'identifier', size = 150, start = 0, excludeFields = null, includeFields = null, skipCache = false }) {
    if (skipCache || (!context.state.items || context.state.items.length === 0)) {
      let query = new SearchQuery()
      if (filterValues) {
        query = query.applyFilter({key: filterField, value: {'like': filterValues}})
      }
      return quickSearchByQuery({ query, entityType: 'cms_page', excludeFields, includeFields })
      .then((resp) => {
        context.commit(types.CMS_PAGE_UPDATE_CMS_PAGES, resp.items)
        return resp.items
      })
      .catch(err => {
        console.error(err)
      })
    } else {
      return new Promise((resolve, reject) => {
        let resp = context.state.items
        resolve(resp)
      })
    }
  },

  /**
   * Retrieve single cms page by key value
   *
   * @param context
   * @param {any} key
   * @param {any} value
   * @param {any} excludeFields
   * @param {any} includeFields
   * @returns {Promise<T> & Promise<any>}
   */
  single (context, { key = 'identifier', value, excludeFields = null, includeFields = null, skipCache = false }) {
    let query = new SearchQuery()
    if (value) {
      query = query.applyFilter({key: key, value: {'like': value}})
    }
    if (skipCache || (!context.state.items || context.state.items.length === 0) || !context.state.items.find(p => p[key] === value)) {
      return quickSearchByQuery({ query, entityType: 'cms_page', excludeFields, includeFields })
      .then((resp) => {
        context.commit(types.CMS_PAGE_ADD_CMS_PAGE, resp.items[0])
        return resp.items[0]
      })
      .catch(err => {
        console.error(err)
      })
    } else {
      cacheStorage.getItem(cmsPagesStorageKey, (err, storedItems) => {
        if (err) throw new Error(err)
        if (storedItems) {
          context.commit(types.CMS_PAGE_UPDATE_CMS_PAGES, storedItems)
          return storedItems.find(p => p[key] === value)
        }
      })
      return new Promise((resolve, reject) => {
        let resp = context.state.items.find(p => p[key])
        resolve(resp)
      })
    }
  },

  addItem ({ commit }, page) {
    commit(types.CMS_PAGE_ADD_CMS_PAGE, page )
  }

}

export default actions