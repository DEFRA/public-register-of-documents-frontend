'use strict'

const server = require('../../src/server')
const TestHelper = require('../utilities/test-helper')

describe('Enter Permit Number route', () => {
  const url = '/enter-permit-number'
  const nextUrlKnownPermitNumber = '/view-permit-details'
  const nextUrlUnnownPermitNumber = '/epr-redirect'

  const elementIDs = {
    yesOption: 'know-permit-number',
    noOption: 'know-permit-number-2',
    permitNumberField: 'permit-number',
    redirectionMessage: 'redirection-message',
    continueButton: 'continue-button'
  }

  let document

  beforeAll((done) => {
    server.events.on('start', () => {
      done()
    })
  })

  afterAll((done) => {
    jest.clearAllMocks()

    server.events.on('stop', () => {
      done()
    })
    server.stop()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
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
      const element = document.querySelector('.govuk-fieldset__legend')
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Do you know the permit number of the record you are looking for?')
    })

    it('should have the unselected "Yes" radio option', () => {
      const element = document.querySelector(`#${elementIDs.yesOption}`)
      expect(element).toBeTruthy()
      expect(element.value).toEqual('yes')
      expect(element.checked).toBeFalsy()

      const elementLabel = document.querySelector(`label[for="${elementIDs.yesOption}"]`)
      expect(elementLabel).toBeTruthy()
      expect(TestHelper.getTextContent(elementLabel)).toEqual('Yes')
    })

    it('should have the unselected "No" radio option', () => {
      const element = document.querySelector(`#${elementIDs.noOption}`)
      expect(element).toBeTruthy()
      expect(element.value).toEqual('no')
      expect(element.checked).toBeFalsy()

      const elementLabel = document.querySelector(`label[for="${elementIDs.noOption}"]`)
      expect(elementLabel).toBeTruthy()
      expect(TestHelper.getTextContent(elementLabel)).toEqual('No')
    })

    it('should have a hidden permit number field', () => {
      const element = document.querySelector(`.govuk-radios__conditional--hidden #${elementIDs.permitNumberField}`)
      expect(element).toBeTruthy()
    })

    it('should have a hidden ePR redirection message', () => {
      const element = document.querySelector(`.govuk-radios__conditional--hidden #${elementIDs.redirectionMessage}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('You will be redirected to the Electronic Public Register search page to assist you in finding the record you are looking for')
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

    beforeEach(async () => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success', () => {
      it('should progress to the next route when the permit number is known', async () => {
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = 'ABC123'

        response = await TestHelper.submitPostRequest(server, postOptions)
        expect(response.headers.location).toEqual(nextUrlKnownPermitNumber)
      })

      it('should redirect to ePR when the permit number is not known', async () => {
        postOptions.payload.knowPermitNumber = 'no'

        response = await TestHelper.submitPostRequest(server, postOptions)
        expect(response.headers.location).toEqual(nextUrlUnnownPermitNumber)
      })
    })

    describe('Failure', () => {
      it('should display a validation error message if the user does not select a Yes or No option', async () => {
        postOptions.payload.knowPermitNumber = ''

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'knowPermitNumber',
          'know-permit-number-error',
          'Select an option')
      })

      it('should display a validation error message if the user selects "Yes" but does not enter a permit number', async () => {
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = ''

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'permitNumber',
          'permit-number-error',
          'Enter the permit number')
      })

      it('should display a validation error message if the user selects "Yes" but enters a blank permit number', async () => {
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = '       '

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'permitNumber',
          'permit-number-error',
          'Enter the permit number')
      })

      it('should display a validation error message if the user selects "Yes" but enters a permit number that is too long', async () => {
        postOptions.payload.knowPermitNumber = 'yes'
        postOptions.payload.permitNumber = '01234567890123456789012345678901234567890123456789X'
        const MAX_LENGTH = 20

        response = await TestHelper.submitPostRequest(server, postOptions, 400)

        await TestHelper.checkValidationError(
          response,
          'permitNumber',
          'permit-number-error',
          `Enter a shorter permit number with no more than ${MAX_LENGTH} characters`)
      })
    })
  })
})