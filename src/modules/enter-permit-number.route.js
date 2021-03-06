'use strict'

const { setQueryData } = require('@envage/hapi-govuk-journey-map')
const Joi = require('joi')
const { logger } = require('defra-logging-facade')
const { handleValidationErrors, raiseCustomValidationError } = require('../utils/validation')
const { sanitisePermitNumber } = require('../utils/general')

const { Registers, Views } = require('../constants')

const AppInsightsService = require('../services/app-insights.service')
const MiddlewareService = require('../services/middleware.service')

const PERMIT_NUMBER_MAX_LENGTH = 30

module.exports = [
  {
    method: 'GET',
    handler: (request, h) => {
      const context = _getContext(request)
      return h.view(Views.ENTER_PERMIT_NUMBER.route, context)
    }
  },
  {
    method: 'POST',
    handler: async (request, h) => {
      const context = _getContext(request)

      await setQueryData(request, {
        knowPermitNumber: context.knowPermitNumber,
        permitNumber: context.knowPermitNumber === 'yes' ? context.permitNumber : null
      })

      if (context.knowPermitNumber === 'no') {
        return h.continue
      }

      const santisedPermitNumber = sanitisePermitNumber(context.register, context.permitNumber)

      const middlewareService = new MiddlewareService()
      const permitExists = await middlewareService.checkPermitExists(santisedPermitNumber, context.register)

      if (!permitExists) {
        logger.info(`Permit number: [${context.permitNumber}] not found for register: [${context.register}]`)

        _sendAppInsight({
          name: 'KPI 3 - User-entered permit number has failed to match a permit',
          properties: {
            permitNumber: context.permitNumber,
            sanitisedPermitNumber: santisedPermitNumber,
            register: context.register
          }
        })
      }

      if (permitExists) {
        return h.redirect(
          `/${Views.VIEW_PERMIT_DOCUMENTS.route}?permitNumber=${santisedPermitNumber}&register=${context.register}`
        )
      } else {
        return raiseCustomValidationError(
          h,
          Views.ENTER_PERMIT_NUMBER.route,
          context,
          {
            heading: 'To continue, please address the following:',
            fieldId: 'permitNumber',
            errorText: 'Sorry, no permit was found',
            useHref: false
          },
          {
            fieldId: 'permitNumber',
            errorText: 'Enter a different permit number'
          }
        )
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          permitNumber: Joi.string().when('knowPermitNumber', {
            is: 'yes',
            then: Joi.string()
              .trim()
              .required()
              .max(PERMIT_NUMBER_MAX_LENGTH)
          }),
          knowPermitNumber: Joi.string()
            .trim()
            .required()
        }),

        failAction: async (request, h, errors) => {
          const context = _getContext(request)

          const messages = {
            knowPermitNumber: {
              'any.required': 'Select an option'
            },
            permitNumber: {
              'any.required': 'Enter the permit number',
              'string.max': `Enter a shorter permit number with no more than ${PERMIT_NUMBER_MAX_LENGTH} characters`
            }
          }

          return handleValidationErrors(request, h, errors, Views.ENTER_PERMIT_NUMBER.route, context, messages)
        }
      }
    }
  }
]

const _sendAppInsight = event => {
  const appInsightsService = new AppInsightsService()
  appInsightsService.trackEvent(event)
}

const _getContext = request => {
  return {
    pageHeading: Views.ENTER_PERMIT_NUMBER.pageHeading,
    knowPermitNumber: request.payload ? request.payload.knowPermitNumber : null,
    permitNumber: request.payload ? request.payload.permitNumber : null,
    register: request.query ? request.query.register : null,
    registerHint: _getRegiserHint(request)
  }
}

const _getRegiserHint = request => {
  const wasteRegisterHint =
    "Permit numbers will start with 'EAWML' or 'EPR' followed by a combination of numbers (e.g. EAWML 123456) or letters and numbers (e.g. EPR-AB1234CD)"

  const installationsAndRadioactiveRegisterHint =
    "Permit numbers will start with 'EPR' followed by a combination of letters and numbers (e.g. EPR-AB1234CD)"

  const waterRegisterHint = 'Permit numbers are usually a combination of both letters and numbers'

  switch (request.query.register) {
    case Registers.WASTE_OPERATIONS:
      return wasteRegisterHint
    case Registers.INSTALLATIONS:
    case Registers.RADIOACTIVE_SUBSTANCES:
      return installationsAndRadioactiveRegisterHint
    case Registers.DISCHARGES_TO_WATER_AND_GROUNDWATER:
      return waterRegisterHint
  }
}
