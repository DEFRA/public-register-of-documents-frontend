'use strict'

const config = require('../config/config')
const { Views } = require('../constants')

module.exports = [
  {
    method: 'GET',
    handler: async (request, h) => {
      const email = decodeURIComponent(request.query.email)

      return h.view(Views.CONTACT_COMPLETE.route, {
        pageHeading: Views.CONTACT_COMPLETE.pageHeading,
        email,
        timescale: config.informationRequestTimescale
      })
    }
  }
]
