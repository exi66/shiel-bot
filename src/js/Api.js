import axios from 'axios'

const token = window.token

const hasBeenExpired = function () {
  return new Date() >= new Date(window.expired)
}

export default {
  items: {
    /**
     * @param {Array} items
     * @returns {Object}
     */
    async edit(items) {
      if (hasBeenExpired()) {
        return {
          errors: ['Срок авторизации истек!']
        }
      }

      let errors = [],
        warns = [],
        result

      try {
        let res = await axios.post(`/user/${token}/items/edit`, items)
        if (res.data.errors) {
          for (let e of res.data.errors) console.error(e)
          errors = res.data.errors
        }
        if (res.data.warns) {
          for (let w of res.data.warns) console.warn(w)
          warns = res.data.warns
        }
        result = res.data?.result || false
      } catch (e) {
        console.error(e)
        if (e?.response?.data?.errors) {
          errors = errors.concat(e.response.data.errors)
        } else {
          errors.push(e.message)
        }
      }
      return { errors: errors, warns: warns, result: result }
    },
    /**
     * @returns {Object}
     */
    async all() {
      let errors = [],
        warns = [],
        result

      try {
        let res = await axios.get('/all.json')
        result = res.data
      } catch (e) {
        console.error(e)
        errors.push(e.message)
      }
      return { errors: errors, warns: warns, result: result }
    }
  },
  coupons: {
    /**
     * @returns {Object}
     */
    async toggle() {
      if (hasBeenExpired()) {
        return {
          errors: ['Срок авторизации истек!']
        }
      }

      let errors = [],
        warns = [],
        result
      try {
        let res = await axios.get(`/user/${token}/coupons/toggle`)
        if (res.data.errors) {
          for (let e of res.data.errors) console.error(e)
          errors = res.data.errors
        }
        if (res.data.warns) {
          for (let w of res.data.warns) console.warn(w)
          warns = res.data.warns
        }
        result = res.data?.result || false
      } catch (e) {
        console.error(e)
        if (e?.response?.data?.errors) {
          errors = errors.concat(e.response.data.errors)
        } else {
          errors.push(e.message)
        }
      }
      return { errors: errors, warns: warns, result: result }
    }
  },
  queue: {
    /**
     * @returns {Object}
     */
    async toggle() {
      if (hasBeenExpired()) {
        return {
          errors: ['Срок авторизации истек!']
        }
      }

      let errors = [],
        warns = [],
        result
      try {
        let res = await axios.get(`/user/${token}/queue/toggle`)
        if (res.data.errors) {
          for (let e of res.data.errors) console.error(e)
          errors = res.data.errors
        }
        if (res.data.warns) {
          for (let w of res.data.warns) console.warn(w)
          warns = res.data.warns
        }
        result = res.data?.result || false
      } catch (e) {
        console.error(e)
        if (e?.response?.data?.errors) {
          errors = errors.concat(e.response.data.errors)
        } else {
          errors.push(e.message)
        }
      }
      return { errors: errors, warns: warns, result: result }
    }
  }
}
