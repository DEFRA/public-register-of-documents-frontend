'use strict'

const Hoek = require('hoek')
const { logger } = require('defra-logging-facade')

const { Views } = require('../constants')
const { formatDate, formatFileSize } = require('../utils/general')
const MiddlewareService = require('../services/middleware.service')

const DEFAULT_PAGE_SIZE = 20

// These imports will be needed when developing Feature 12215 (Monitor performance of service) and
// Story 7158 (View permit documents, view permit page)
// const AppInsightsService = require('../services/app-insights.service')
// const appInsightsService = new AppInsightsService()

module.exports = {
  method: 'GET',
  handler: async (request, h) => {
    let id
    if (request.params && request.params.id) {
      id = Hoek.escapeHtml(request.params.id)
    }

    let page
    if (request.query && request.query.page) {
      page = parseInt(Hoek.escapeHtml(request.query.page))
    }

    if (!page) {
      page = 1
    }

    // This will be used in Feature 12215 (Monitor performance of service)
    // AppInsights & ePR POC //////////////////
    // appInsightsService.trackEvent({ name: 'Carrying out search page loaded', properties: { runningAt: 'whatever' } })
    // appInsightsService.trackMetric({ name: 'DEFRA custom metric', value: 333 })
    // Generate dummy result count to demonstrate use of event tracking in Azure Application Insights
    // const randomNumber = Math.random()
    // const isSuccessfulSearch = randomNumber > 0.5

    // if (isSuccessfulSearch) {
    //   appInsightsService.trackEvent({ name: 'ePR Referral - success', properties: { resultCount: Math.round(randomNumber * 100) } })
    // } else {
    //   appInsightsService.trackEvent({ name: 'ePR Referral - failure', properties: { resultCount: 0 } })
    // }
    // ///////////////////////////

    logger.info(`Carrying out search for permit number: ${id}`)

    const middlewareService = new MiddlewareService()

    const permitData = await middlewareService.search(
      id,
      page,
      DEFAULT_PAGE_SIZE
    )

    if (permitData.statusCode === 404) {
      logger.info(`Permit number ${id} not found`)
    }

    const viewData = {
      pageHeading: Views.VIEW_PERMIT_DETAILS.pageHeading,
      id,
      permitData
    }

    if (permitData && permitData.result && permitData.result.totalCount) {
      permitData.result.items.forEach(item => {
        // Document file size is initially in bytes so format as KB or MB for display
        item.document.fileSizeFormatted = formatFileSize(item.document.size)
        item.document.uploadDateFormatted = formatDate(item.document.uploadDate)
      })

      const lastPage = Math.ceil(
        permitData.result.totalCount / DEFAULT_PAGE_SIZE
      )
      viewData.previousPage = page > 0 ? page - 1 : null
      viewData.nextPage = page < lastPage ? page + 1 : null
      viewData.pageCount = lastPage
      viewData.paginationRequired = viewData.pageCount > 1
      viewData.showPaginationSeparator =
        viewData.previousPage && viewData.nextPage
      viewData.url = `/${Views.VIEW_PERMIT_DETAILS.route}/${permitData.result.items[0].permitDetails.permitNumber}`
    }

    return h.view(Views.VIEW_PERMIT_DETAILS.route, viewData)
  }
}
