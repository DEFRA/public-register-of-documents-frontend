'use strict'

const server = require('../../src/server')

jest.mock('../../src/services/app-insights.service')
const AppInsightsService = require('../../src/services/app-insights.service')

jest.mock('../../src/services/middleware.service')
const MiddlewareService = require('../../src/services/middleware.service')

const TestHelper = require('../utilities/test-helper')
const mockData = require('../data/permit-data')

describe('Enter Permit Number route', () => {
  const register = 'Installations'
  const url = '/enter-permit-number'
  const nextUrlKnownPermitNumber = '/view-permit-documents'
  const nextUrlUnknownPermitNumber = '/epr-redirect'

  const elementIDs = {
    pageHeading: 'page-heading',
    registerHint: 'register-hint',
    yesOption: 'knowPermitNumber',
    noOption: 'knowPermitNumber-2',
    permitNumberField: 'permitNumber',
    redirectionMessage: 'redirection-message',
    continueButton: 'continue-button'
  }

  let document

  beforeAll(done => {
    server.events.on('start', () => {
      done()
    })
  })

  afterAll(done => {
    server.events.on('stop', () => {
      done()
    })
    server.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url: `${url}?register=${register}`
    }

    beforeEach(async () => {
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should display the correct question', () => {
      const element = document.querySelector(`#${elementIDs.pageHeading}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Do you know the permit number of the record you are looking for?'
      )
    })

    it('should have the unselected "Yes" radio option', () => {
      TestHelper.checkRadioOption(document, elementIDs.yesOption, 'yes', 'Yes')
    })

    it('should have the unselected "No" radio option', () => {
      TestHelper.checkRadioOption(document, elementIDs.noOption, 'no', 'No')
    })

    it('should have a hidden permit number field', () => {
      const element = document.querySelector(`.govuk-radios__conditional--hidden #${elementIDs.permitNumberField}`)
      expect(element).toBeTruthy()
    })

    it('should have a hidden ePR redirection message', () => {
      const element = document.querySelector(`.govuk-radios__conditional--hidden #${elementIDs.redirectionMessage}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'You will be redirected to the Electronic Public Register search page to assist you in finding the record you are looking for'
      )
    })

    it('should have the correct Call-To-Action button', () => {
      const element = document.querySelector(`#${elementIDs.continueButton}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Continue')
    })
  })

  describe('POST', () => {
    let response
    let postOptions

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url: `${url}?register=${register}`,
        payload: {}
      }
    })

    describe('Success', () => {
      beforeEach(() => {
        MiddlewareService.mockImplementation(() => {
          return {
            checkPermitExists: jest.fn().mockReturnValue(true),
            search: jest.fn().mockReturnValue(mockData)
          }
        })

        AppInsightsService.prototype.trackEvent = jest.fn()
      })

      it('should progress to the next route when the permit number is known', async () => {
        const permitNumber = 'EPR-ABC123CD'
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = permitNumber

        response = await TestHelper.submitPostRequest(server, postOptions)

        expect(response.headers.location).toEqual(
          `${nextUrlKnownPermitNumber}?permitNumber=${permitNumber}&register=${register}`
        )
      })

      it('should redirect to ePR when the user has said that they do not know then permit number', async () => {
        postOptions.payload.knowPermitNumber = 'no'

        response = await TestHelper.submitPostRequest(server, postOptions)
        expect(response.headers.location).toEqual(nextUrlUnknownPermitNumber)
      })
    })

    describe('Failure', () => {
      const VALIDATION_SUMMARY_HEADING = 'There is a problem'

      it('should display a validation error message if the user does not select a Yes or No option', async () => {
        postOptions.payload.knowPermitNumber = ''

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'knowPermitNumber',
          'knowPermitNumber-error',
          VALIDATION_SUMMARY_HEADING,
          'Select an option'
        )
      })

      it('should display a validation error message if the user selects "Yes" but does not enter a permit number', async () => {
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = ''

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'permitNumber',
          'permitNumber-error',
          VALIDATION_SUMMARY_HEADING,
          'Enter the permit number'
        )
      })

      it('should display a validation error message if the user selects "Yes" but enters a blank permit number', async () => {
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = '       '

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'permitNumber',
          'permitNumber-error',
          VALIDATION_SUMMARY_HEADING,
          'Enter the permit number'
        )
      })

      it('should display a validation error message if the user selects "Yes" but enters a permit number that is too long', async () => {
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = '01234567890123456789012345678901234567890123456789X'
        const MAX_LENGTH = 30

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'permitNumber',
          'permitNumber-error',
          VALIDATION_SUMMARY_HEADING,
          `Enter a shorter permit number with no more than ${MAX_LENGTH} characters`
        )
      })

      it('should display a validation error when the permit number is unknown', async () => {
        MiddlewareService.mockImplementation(() => {
          return {
            checkPermitExists: jest.fn().mockReturnValue(false)
          }
        })

        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = 'EPR-ABC123CD'

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'permitNumber',
          'permitNumber-error',
          'To continue, please address the following:',
          'Sorry, no permit was found',
          'Enter a different permit number',
          false
        )
      })
    })

    describe('App Insights', () => {
      beforeEach(() => {
        MiddlewareService.mockImplementation(() => {
          return {
            checkPermitExists: jest.fn().mockReturnValue(false),
            search: jest.fn().mockReturnValue(mockData)
          }
        })

        AppInsightsService.prototype.trackEvent = jest.fn()
      })

      it('should record the KPI event in AppInsights when a user-entered permit number has failed to match a permit (KPI 3)', async () => {
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = 'ABC123CD'

        expect(AppInsightsService.prototype.trackEvent).toBeCalledTimes(0)

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        expect(AppInsightsService.prototype.trackEvent).toBeCalledTimes(1)

        expect(AppInsightsService.prototype.trackEvent).toBeCalledWith(
          expect.objectContaining({
            name: 'KPI 3 - User-entered permit number has failed to match a permit',
            properties: {
              permitNumber: 'ABC123CD',
              sanitisedPermitNumber: 'EPR-ABC123CD',
              register: 'Installations'
            }
          })
        )
      })
    })
  })

  describe('GET - Permit number hint', () => {
    const expectedHint1 =
      "Permit numbers will start with 'EAWML' or 'EPR' followed by a combination of numbers (e.g. EAWML 123456) or letters and numbers (e.g. EPR-AB1234CD)"

    const expectedHint2 =
      "Permit numbers will start with 'EPR' followed by a combination of letters and numbers (e.g. EPR-AB1234CD)"

    const expectedHint3 = 'Permit numbers are usually a combination of both letters and numbers'

    const getOptions = {
      method: 'GET'
    }

    it('should display the correct hint for "Waste Operations" and "End of Life vehicles"', async () => {
      getOptions.url = `${url}?register=Waste Operations`
      document = await TestHelper.submitGetRequest(server, getOptions)
      const element = document.querySelector(`#${elementIDs.registerHint}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(expectedHint1)
    })

    it('should display the correct hint for "Installations"', async () => {
      getOptions.url = `${url}?register=Installations`
      document = await TestHelper.submitGetRequest(server, getOptions)
      const element = document.querySelector(`#${elementIDs.registerHint}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(expectedHint2)
    })

    it('should display the correct hint for "Radioactive Substances"', async () => {
      getOptions.url = `${url}?register=Radioactive Substances`
      document = await TestHelper.submitGetRequest(server, getOptions)
      const element = document.querySelector(`#${elementIDs.registerHint}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(expectedHint2)
    })

    it('should display the correct hint for "Discharges to water and groundwater"', async () => {
      getOptions.url = `${url}?register=Water Quality Discharge Consents`
      document = await TestHelper.submitGetRequest(server, getOptions)
      const element = document.querySelector(`#${elementIDs.registerHint}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(expectedHint3)
    })
  })
})
