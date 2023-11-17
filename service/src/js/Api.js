import axios from 'axios'
const host = 'https://sandbox.exi.moe/bdo-market/api/'

export default {
  items: {
    /**
     * @returns {Object}
     */
    async get() {
      let errors = [],
        warns = [],
        result
      try {
        let res = await axios.post(host + 'items/get.php', {
          user: window.id
        })
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
        errors.push(e.message)
      }
      return { errors: errors, warns: warns, result: result }
    },
    /**
     * @param {String} item
     * @returns {Object}
     */
    async edit(items) {
      let errors = [],
        warns = [],
        data = { user: window.id },
        result

      data.items = items
      try {
        let res = await axios.post(host + 'items/edit.php', data)
        if (res.data.errors) {
          for (let e of res.data.errors) console.error(e)
          errors = res.data.errors
        }
        if (res.data.warns) {
          for (let w of res.data.warns) console.warn(w)
          warns = res.data.warns
        }
        result = res.data?.result === 'success' || false
      } catch (e) {
        console.error(e)
        errors.push(e.message)
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
        let res = await axios.get(host + 'items/all.json')
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
    async get() {
      let errors = [],
        warns = [],
        result
      try {
        let res = await axios.post(host + 'coupons/get.php', {
          user: window.id
        })
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
        errors.push(e.message)
      }
      return { errors: errors, warns: warns, result: result }
    },
    /**
     * @returns {Object}
     */
    async toggle() {
      let errors = [],
        warns = [],
        result
      try {
        let res = await axios.post(host + 'coupons/toggle.php', {
          user: window.id
        })
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
        errors.push(e.message)
      }
      return { errors: errors, warns: warns, result: result }
    }
  },
  queue: {
    /**
     * @returns {Object}
     */
    async get() {
      let errors = [],
        warns = [],
        result
      try {
        let res = await axios.post(host + 'queue/get.php', {
          user: window.id
        })
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
        errors.push(e.message)
      }
      return { errors: errors, warns: warns, result: result }
    },
    /**
     * @returns {Object}
     */
    async toggle() {
      let errors = [],
        warns = [],
        result
      try {
        let res = await axios.post(host + 'queue/toggle.php', {
          user: window.id
        })
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
        errors.push(e.message)
      }
      return { errors: errors, warns: warns, result: result }
    }
  }
}
