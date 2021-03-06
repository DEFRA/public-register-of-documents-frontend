'use strict'

const server = require('../../src/server')
const TestHelper = require('../utilities/test-helper')
const mockData = require('../data/permit-data')

jest.mock('../../src/services/app-insights.service')
const AppInsightsService = require('../../src/services/app-insights.service')

jest.mock('../../src/services/middleware.service')
const MiddlewareService = require('../../src/services/middleware.service')

describe('View Permit Documents route', () => {
  const permitNumber = 'AP3130GV'
  const sanitisedPermitNumber = `EPR-${permitNumber}`
  const register = 'Installations'
  const url = `/view-permit-documents?permitNumber=${permitNumber}&register=${register}`
  const urlSearchMode = '/view-permit-documents?pageMode=search'
  const nextUrlUnknownPermitNumber = `/permit-not-found?permitNumber=${permitNumber}&register=${register}`

  const elementIDs = {
    pageHeading: 'page-heading',
    permitInformation: {
      permitNumberCaption: 'permit-number-caption',
      siteNameHeading: 'site-name-heading'
    },
    summaryList: {
      registerKey: 'summary-list-register-key',
      registerValue: 'summary-list-register-value',
      addressKey: 'summary-list-address-key',
      addressValue: 'summary-list-address-value',
      postcodeKey: 'summary-list-postcode-key',
      postcodeValue: 'summary-list-postcode-value'
    },
    sortingPanel: {
      sort: 'sort',
      sortByOptionNewest: 'sort-by-option-newest',
      sortByOptionOldest: 'sort-by-option-oldest'
    },
    filterPanel: {
      documentSearchExpander: 'document-search-expander',
      documentTypeExpander: 'document-type-expander',
      uploadedDateExpander: 'uploaded-date-expander',
      documentTypes: 'documentTypes',
      uploadedAfterLabel: 'uploaded-after-label',
      uploadedAfterHint: 'uploaded-after-hint',
      uploadedAfter: 'uploaded-after',
      uploadedBeforeLabel: 'uploaded-before-label',
      uploadedBeforeHint: 'uploaded-before-hint',
      uploadedBefore: 'uploaded-before'
    },
    documentsPanel: {
      documentsHeading: 'documents-heading',
      documentCount: 'document-count',
      documentCountSeparator: 'document-count-separator',
      documentList: 'document-list',
      documentSearch: 'document-search',
      documentDetail: 'document-detail',
      documentDetailSize: 'document-detail-size',
      cantFindLink: 'cant-find-link'
    },
    pagination: {
      paginationPanel: 'pagination-panel',
      paginationSeparator: 'pagination-separator',
      previous: {
        Panel: 'pagination-previous',
        Icon: 'pagination-previous-icon',
        PageLabel: 'pagination-previous-page-label',
        PageCounterLabel: 'pagination-previous-page-counter-label'
      },
      next: {
        Panel: 'pagination-next',
        Icon: 'pagination-next-icon',
        PageLabel: 'pagination-next-page-label',
        PageCounterLabel: 'pagination-next-page-counter-label'
      }
    }
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

  beforeEach(() => {
    MiddlewareService.mockImplementation(() => {
      return {
        checkPermitExists: jest.fn().mockReturnValue(true),
        search: jest.fn().mockReturnValue(mockData),
        searchIncludingAllDocumentTypes: jest.fn().mockReturnValue(mockData),
        searchAcrossPermits: jest.fn().mockReturnValue(mockData)
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET: Permit number search - known permit number', () => {
    const getOptions = {
      method: 'GET',
      url: `${url}`
    }

    beforeEach(async () => {
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    describe('Page headers', () => {
      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should have the Back link', () => {
        TestHelper.checkBackLink(document)
      })
    })

    describe('Permit information', () => {
      it('should have the permit number caption', async () => {
        const element = document.querySelector(`#${elementIDs.permitInformation.permitNumberCaption}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Permit EAWML 65519')
      })

      it('should have the site name heading', async () => {
        const element = document.querySelector(`#${elementIDs.permitInformation.siteNameHeading}`)
        expect(element).toBeTruthy()
        const siteName = 'Site On Trevor Street'
        expect(TestHelper.getTextContent(element)).toEqual(`${siteName}`)
      })

      it('should show the permit Register', async () => {
        let element = document.querySelector(`#${elementIDs.summaryList.registerKey}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Register')

        element = document.querySelector(`#${elementIDs.summaryList.registerValue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Installations')
      })

      it('should show the permit Address', async () => {
        let element = document.querySelector(`#${elementIDs.summaryList.addressKey}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Address')

        element = document.querySelector(`#${elementIDs.summaryList.addressValue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('20 Trevor Street Hull Humberside')
      })

      it('should show the permit Postcode', async () => {
        let element = document.querySelector(`#${elementIDs.summaryList.postcodeKey}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Postcode')

        element = document.querySelector(`#${elementIDs.summaryList.postcodeValue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('HU2 0HR')
      })
    })

    describe('Sorting', () => {
      it('should have the Sort dropdown', async () => {
        let element = document.querySelector(`#${elementIDs.sortingPanel.sort}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.sortingPanel.sortByOptionNewest}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Newest')

        element = document.querySelector(`#${elementIDs.sortingPanel.sortByOptionOldest}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Oldest')
      })
    })

    describe('Filter panel', () => {
      it('should have the Filter panel', async () => {
        let element = document.querySelector(`#${elementIDs.filterPanel.documentTypeExpander}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedDateExpander}`)
        expect(element).toBeTruthy()

        for (let i = 1; i < 7; i++) {
          const index = i === 1 ? '' : `-${i}`
          element = document.querySelector(`#${elementIDs.filterPanel.documentTypes}${index}`)
          expect(element).toBeTruthy()
        }

        element = document.querySelector(`#${elementIDs.filterPanel.documentTypes}-7`)
        expect(element).toBeFalsy()

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedAfterLabel}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Uploaded after')

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedAfterHint}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('For example, 2005 or 21/11/2014')

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedAfter}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedBeforeLabel}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Uploaded before')

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedBeforeHint}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('For example, 2005 or 21/11/2014')

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedBefore}`)
        expect(element).toBeTruthy()
      })
    })

    describe('Documents panel', () => {
      it('should have the "Documents" heading', async () => {
        const element = document.querySelector(`#${elementIDs.documentsPanel.documentsHeading}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Documents')
      })

      it('should show the result count', async () => {
        let element = document.querySelector(`#${elementIDs.documentsPanel.documentCount}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('41 results')

        element = document.querySelector(`#${elementIDs.documentsPanel.documentCountSeparator}`)
        expect(element).toBeTruthy()
      })

      it('should show the document list', async () => {
        let element = document.querySelector(`#${elementIDs.documentsPanel.documentList}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.documentsPanel.documentCountSeparator}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.documentsPanel.documentSearch}-1`)
        expect(TestHelper.getTextContent(element)).toEqual('CAR Form')
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.documentsPanel.documentDetail}-1`)
        expect(TestHelper.getTextContent(element)).toEqual('Licence Supervision')
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.documentsPanel.documentDetailSize}-1`)
        expect(TestHelper.getTextContent(element)).toEqual('MSG - 90 KB - Uploaded 29th October 1985')
        expect(element).toBeTruthy()
      })

      it('should show the "I can\'t find what I am looking for" link', async () => {
        const element = document.querySelector(`#${elementIDs.documentsPanel.cantFindLink}`)
        expect(TestHelper.getTextContent(element)).toEqual("I can't find what I am looking for")
        expect(element).toBeTruthy()
      })
    })
  })

  describe('GET: Search across all permits', () => {
    const getOptions = {
      method: 'GET',
      url: urlSearchMode
    }

    beforeEach(async () => {
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    describe('Page headers', () => {
      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should have the Back link', () => {
        TestHelper.checkBackLink(document)
      })

      it('should display the correct heading', () => {
        const element = document.querySelector(`#${elementIDs.pageHeading}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Browse public register documents')
      })
    })

    describe('Permit information', () => {
      it('should NOT have the permit number information', async () => {
        const ids = [
          `#${elementIDs.permitInformation.permitNumberCaption}`,
          `#${elementIDs.permitInformation.siteNameHeading}`,
          `#${elementIDs.summaryList.registerKey}`,
          `#${elementIDs.summaryList.registerValue}`,
          `#${elementIDs.summaryList.addressKey}`,
          `#${elementIDs.summaryList.addressValue}`,
          `#${elementIDs.summaryList.postcodeKey}`,
          `#${elementIDs.summaryList.postcodeValue}`
        ]
        ids.forEach(id => expect(document.querySelector(id)).toBeFalsy())
      })
    })

    describe('Sorting', () => {
      it('should not have the Sort dropdown', async () => {
        const element = document.querySelector(`#${elementIDs.sortingPanel.sort}`)
        expect(element).toBeFalsy()
      })
    })

    describe('Filter panel', () => {
      it('should have the Filter panel', async () => {
        let element = document.querySelector(`#${elementIDs.filterPanel.documentTypeExpander}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedDateExpander}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.filterPanel.documentTypes}`)
        expect(element).toBeFalsy()

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedAfterLabel}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Uploaded after')

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedAfterHint}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('For example, 2005 or 21/11/2014')

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedAfter}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedBeforeLabel}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Uploaded before')

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedBeforeHint}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('For example, 2005 or 21/11/2014')

        element = document.querySelector(`#${elementIDs.filterPanel.uploadedBefore}`)
        expect(element).toBeTruthy()
      })
    })

    describe('Documents panel', () => {
      it('should NOT have the "Documents" heading', async () => {
        const element = document.querySelector(`#${elementIDs.documentsPanel.documentsHeading}`)
        expect(element).toBeFalsy()
      })

      it('should not show the result count', async () => {
        const element = document.querySelector(`#${elementIDs.documentsPanel.documentCount}`)
        expect(element).toBeFalsy()
      })

      it('should not show the document list', async () => {
        const element = document.querySelector(`#${elementIDs.documentsPanel.documentList}`)
        expect(element).toBeFalsy()
      })

      it('should show the "I can\'t find what I am looking for" link', async () => {
        const element = document.querySelector(`#${elementIDs.documentsPanel.cantFindLink}`)
        expect(TestHelper.getTextContent(element)).toEqual("I can't find what I am looking for")
        expect(element).toBeTruthy()
      })
    })
  })

  describe('GET: Unknown permit number', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(() => {
      MiddlewareService.mockImplementation(() => {
        return {
          search: jest.fn().mockReturnValue({
            statusCode: 404,
            correlationId: null,
            message: 'Resource not found'
          })
        }
      })
    })

    describe('Permit information', () => {
      it('should redirect to the Permit Not Found page when the permit number is not known', async () => {
        const response = await TestHelper.getResponse(server, getOptions, 302)
        expect(response.headers.location).toEqual(nextUrlUnknownPermitNumber)
      })
    })
  })

  describe('Pagination', () => {
    describe('Pagination: GET', () => {
      const getOptions = {
        method: 'GET',
        url
      }

      it('should hide the PREVIOUS pagination control when the first page is being displayed', async () => {
        document = await TestHelper.submitGetRequest(server, getOptions)

        let element = document.querySelector(`#${elementIDs.pagination.paginationPanel}`)
        expect(element).toBeTruthy()

        element = document.querySelector(`#${elementIDs.pagination.paginationSeparator}`)
        expect(element).toBeFalsy()

        element = document.querySelector(`#${elementIDs.pagination.previous.Panel}`)
        expect(element).toBeFalsy()

        checkNextButton(document, 2, 3)
      })
    })

    describe('Pagination: POST', () => {
      const postOptions = {
        method: 'POST',
        url,
        payload: {}
      }

      it('should show pagination controls when a middle page is being dislayed', async () => {
        postOptions.payload.page = 2
        const response = await TestHelper.submitPostRequest(server, postOptions, 200)
        const document = await TestHelper.getDocument(response)
        let element = document.querySelector(`#${elementIDs.pagination.paginationPanel}`)
        expect(element).toBeTruthy()
        element = document.querySelector(`#${elementIDs.pagination.paginationSeparator}`)
        expect(element).toBeTruthy()
        checkPreviousButton(document, 1, 3)
        checkNextButton(document, 3, 3)
      })

      it('should hide the NEXT pagination control when the last page is being displayed', async () => {
        postOptions.payload.page = 3
        const response = await TestHelper.submitPostRequest(server, postOptions, 200)
        const document = await TestHelper.getDocument(response)

        let element = document.querySelector(`#${elementIDs.pagination.paginationPanel}`)
        expect(element).toBeTruthy()
        element = document.querySelector(`#${elementIDs.pagination.paginationSeparator}`)
        expect(element).toBeFalsy()
        element = document.querySelector(`#${elementIDs.pagination.next.Panel}`)
        expect(element).toBeFalsy()
        checkPreviousButton(document, 2, 3)
      })
    })

    const checkPreviousButton = (document, expectedPageNumber, expectedPageCount) => {
      let element = document.querySelector(`#${elementIDs.pagination.previous.Panel}`)
      expect(element).toBeTruthy()
      element = document.querySelector(`#${elementIDs.pagination.previous.Icon}`)
      expect(element).toBeTruthy()
      element = document.querySelector(`#${elementIDs.pagination.previous.PageLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Previous page')
      element = document.querySelector(`#${elementIDs.pagination.previous.PageCounterLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(`${expectedPageNumber} of ${expectedPageCount}`)
    }

    const checkNextButton = (document, expectedPageNumber, expectedPageCount) => {
      let element = document.querySelector(`#${elementIDs.pagination.next.Panel}`)
      expect(element).toBeTruthy()
      element = document.querySelector(`#${elementIDs.pagination.next.Icon}`)
      expect(element).toBeTruthy()
      element = document.querySelector(`#${elementIDs.pagination.next.PageLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Next page')
      element = document.querySelector(`#${elementIDs.pagination.next.PageCounterLabel}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(`${expectedPageNumber} of ${expectedPageCount}`)
    }
  })

  describe('App Insights', () => {
    const getOptions = {
      method: 'GET'
    }

    it('should record an event when a user-entered permit number has successfully matched a permit (KPI 1)', async () => {
      getOptions.url = url
      expect(AppInsightsService.prototype.trackEvent).toBeCalledTimes(0)

      await TestHelper.submitGetRequest(server, getOptions)

      expect(AppInsightsService.prototype.trackEvent).toBeCalledTimes(1)
      expect(AppInsightsService.prototype.trackEvent).toBeCalledWith(
        expect.objectContaining({
          name: 'KPI 1 - User-entered permit number has successfully matched a permit',
          properties: {
            permitNumber,
            sanitisedPermitNumber,
            register
          }
        })
      )
    })

    it('should record an event when a referral from ePR has successfully matched a permit (KPI 2)', async () => {
      getOptions.url = `${url}&Referer=EPR`

      expect(AppInsightsService.prototype.trackEvent).toBeCalledTimes(0)

      await TestHelper.submitGetRequest(server, getOptions, 200)

      expect(AppInsightsService.prototype.trackEvent).toBeCalledTimes(1)
      expect(AppInsightsService.prototype.trackEvent).toBeCalledWith(
        expect.objectContaining({
          name: 'KPI 2 - Referral from ePR has successfully matched a permit',
          properties: {
            licenceNumber: 'Not specified',
            permissionNumber: 'Not specified',
            permitNumber,
            sanitisedPermitNumber,
            register
          }
        })
      )
    })

    it('should record an event when a referral from ePR has failed to match a permit (KPI 4)', async () => {
      MiddlewareService.mockImplementation(() => {
        return {
          search: jest.fn().mockReturnValue({
            message:
              'A resource associated with the request could not be found. Please try with different search criteria.',
            statusCode: 404
          })
        }
      })
      getOptions.url = `/view-permit-documents?permitNumber=${permitNumber}xxx&register=${register}&Referer=EPR`

      expect(AppInsightsService.prototype.trackEvent).toBeCalledTimes(0)

      await TestHelper.submitGetRequest(server, getOptions, 302)

      expect(AppInsightsService.prototype.trackEvent).toBeCalledTimes(1)
      expect(AppInsightsService.prototype.trackEvent).toBeCalledWith(
        expect.objectContaining({
          name: 'KPI 4 - Referral from ePR has failed to match a permit',
          properties: {
            licenceNumber: 'Not specified',
            permissionNumber: 'Not specified',
            permitNumber: `${permitNumber}xxx`,
            sanitisedPermitNumber: `${sanitisedPermitNumber}XXX`,
            register
          }
        })
      )
    })
  })

  describe('POST: Permit number search', () => {
    let response
    let postOptions
    let document

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }

      AppInsightsService.prototype.trackEvent = jest.fn()
    })

    describe('Success', () => {
      describe('View Permit Details page', () => {
        beforeEach(async () => {
          postOptions.payload.permitNumber = permitNumber
          response = await TestHelper.submitPostRequest(server, postOptions, 200)
          document = await TestHelper.getDocument(response)
        })

        it('should have the permit number caption', async () => {
          const element = document.querySelector(`#${elementIDs.permitInformation.permitNumberCaption}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Permit EAWML 65519')
        })

        it('should have the site name heading', async () => {
          const element = document.querySelector(`#${elementIDs.permitInformation.siteNameHeading}`)
          expect(element).toBeTruthy()
          const siteName = 'Site On Trevor Street'
          expect(TestHelper.getTextContent(element)).toEqual(`${siteName}`)
        })
      })

      describe('Filter tags', () => {
        describe('Initialisation', () => {
          beforeEach(async () => {
            postOptions.payload.permitNumber = 'ABC123'
            postOptions.payload.documentTypes = ['General', 'Waste Returns']
            postOptions.payload['uploaded-after'] = '2000'
            postOptions.payload['uploaded-before'] = '2020'
            response = await TestHelper.submitPostRequest(server, postOptions, 200)
            document = await TestHelper.getDocument(response)
          })

          it('should have the Document Type filter tags', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-1')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('General')

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-2')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('Waste Returns')

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-3')
            expect(element).toBeFalsy()
          })

          it('should have the Upload Date filter tags', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('1st January 2000')

            element = document.querySelector('#view-permit-documents-tags-row-2-tag-2')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('1st January 2020')
          })
        })

        describe('Tag removal - Document Types', () => {
          beforeEach(async () => {
            postOptions.payload.permitNumber = 'ABC123'
            postOptions.payload.documentTypes = ['General', 'Inpsection', 'Waste Returns']

            postOptions.payload.clickedItem = 'Inpsection'
            postOptions.payload.clickedItemIndex = '2'
            postOptions.payload.clickedRow = 'Document types'

            response = await TestHelper.submitPostRequest(server, postOptions, 200)
            document = await TestHelper.getDocument(response)
          })

          it('should be able to remove a v Type filter tag when the tag has been clicked on', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-1')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('General')

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-2')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('Waste Returns')

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-3')
            expect(element).toBeFalsy()
          })
        })

        describe('Tag removal - Uploaded after', () => {
          beforeEach(async () => {
            postOptions.payload.permitNumber = 'ABC123'
            postOptions.payload.documentTypes = ['General', 'Inpsection', 'Waste Returns']
            postOptions.payload['uploaded-after'] = '2000'

            postOptions.payload.clickedItem = '1st January 2000'
            postOptions.payload.clickedItemIndex = '1'
            postOptions.payload.clickedRow = 'Uploaded after'

            response = await TestHelper.submitPostRequest(server, postOptions, 200)
            document = await TestHelper.getDocument(response)
          })

          it('should have removed the "Uploaded after" filter tag', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
            expect(element).toBeFalsy()
          })
        })

        describe('Tag removal - Uploaded before', () => {
          beforeEach(async () => {
            postOptions.payload.permitNumber = 'ABC123'
            postOptions.payload.documentTypes = ['General', 'Inpsection', 'Waste Returns']
            postOptions.payload['uploaded-before'] = '2020'

            postOptions.payload.clickedItem = '1st January 2020'
            postOptions.payload.clickedItemIndex = '1'
            postOptions.payload.clickedRow = 'Uploaded before'

            response = await TestHelper.submitPostRequest(server, postOptions, 200)
            document = await TestHelper.getDocument(response)
          })

          it('should have removed the "Uploaded before" filter tag', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
            expect(element).toBeFalsy()
          })
        })
      })

      describe('Tag removal - Uploaded between', () => {
        beforeEach(() => {
          postOptions.payload.permitNumber = 'ABC123'
          postOptions.payload.documentTypes = ['General', 'Inpsection', 'Waste Returns']
          postOptions.payload['uploaded-after'] = '2000'
          postOptions.payload['uploaded-before'] = '2020'
        })

        it('should have removed the "Uploaded after" filter tag', async () => {
          postOptions.payload.clickedItem = '1st January 2000'
          postOptions.payload.clickedItemIndex = '1'
          postOptions.payload.clickedRow = 'Uploaded after'

          response = await TestHelper.submitPostRequest(server, postOptions, 200)

          document = await TestHelper.getDocument(response)

          let element = document.querySelector('#view-permit-documents-tags')
          expect(element).toBeTruthy()

          element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('1st January 2020')

          element = document.querySelector('#view-permit-documents-tags-row-2-tag-2')
          expect(element).toBeFalsy()
        })

        it('should have removed the "Uploaded before" filter tag', async () => {
          postOptions.payload.clickedItem = '1st January 2020'
          postOptions.payload.clickedItemIndex = '1'
          postOptions.payload.clickedRow = 'Uploaded before'

          response = await TestHelper.submitPostRequest(server, postOptions, 200)

          document = await TestHelper.getDocument(response)

          let element = document.querySelector('#view-permit-documents-tags')
          expect(element).toBeTruthy()

          element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('1st January 2000')

          element = document.querySelector('#view-permit-documents-tags-row-2-tag-2')
          expect(element).toBeFalsy()
        })
      })
    })

    describe('Failure', () => {
      describe('View Permit Details page', () => {
        it('should show validation error when the "Uploaded after" date is invalid', async () => {
          postOptions.payload.permitNumber = 'ABC123'
          postOptions.payload['uploaded-after'] = 'XXXXX'
          postOptions.payload['uploaded-before'] = '2000'
          response = await TestHelper.submitPostRequest(server, postOptions, 200)
          document = await TestHelper.getDocument(response)

          const element = document.querySelector('#uploaded-after-error')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Error: Enter a real date')
        })

        it('should show validation error when the "Uploaded before" date is invalid', async () => {
          postOptions.payload.permitNumber = 'ABC123'
          postOptions.payload['uploaded-after'] = '2000'
          postOptions.payload['uploaded-before'] = 'XXXXX'
          response = await TestHelper.submitPostRequest(server, postOptions, 200)
          document = await TestHelper.getDocument(response)

          const element = document.querySelector('#uploaded-before-error')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Error: Enter a real date')
        })

        it('should show validation error when "Uploaded before" is before "Uploaded after"', async () => {
          postOptions.payload.permitNumber = 'ABC123'
          postOptions.payload['uploaded-after'] = '2000'
          postOptions.payload['uploaded-before'] = '1995'
          response = await TestHelper.submitPostRequest(server, postOptions, 200)
          document = await TestHelper.getDocument(response)

          const element = document.querySelector('#uploaded-before-error')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Error: "Uploaded before" must be later than "Uploaded after"'
          )
        })
      })
    })
  })

  describe('POST: Search across permits', () => {
    let response
    let postOptions
    let document

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url: urlSearchMode,
        payload: {
          isSearchMode: 'true',
          'document-search': 'my query'
        }
      }

      AppInsightsService.prototype.trackEvent = jest.fn()
    })

    describe('Success', () => {
      describe('View Permit Details page', () => {
        beforeEach(async () => {
          postOptions.payload.permitNumber = permitNumber
          response = await TestHelper.submitPostRequest(server, postOptions, 200)
          document = await TestHelper.getDocument(response)
        })

        it('should not have the permit number caption', async () => {
          const element = document.querySelector(`#${elementIDs.permitInformation.permitNumberCaption}`)
          expect(element).toBeFalsy()
        })

        it('should not have the site name heading', async () => {
          const element = document.querySelector(`#${elementIDs.permitInformation.siteNameHeading}`)
          expect(element).toBeFalsy()
        })

        it('should display the correct heading', () => {
          const element = document.querySelector(`#${elementIDs.pageHeading}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Browse public register documents')
        })
      })

      describe('Filter tags', () => {
        describe('Initialisation', () => {
          beforeEach(async () => {
            postOptions.payload.permitNumber = 'ABC123'
            postOptions.payload.documentTypes = ['General', 'Waste Returns']
            postOptions.payload['uploaded-after'] = '2000'
            postOptions.payload['uploaded-before'] = '2020'
            response = await TestHelper.submitPostRequest(server, postOptions, 200)
            document = await TestHelper.getDocument(response)
          })

          it('should have the Document Type filter tags', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-1')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('General')

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-2')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('Waste Returns')

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-3')
            expect(element).toBeFalsy()
          })

          it('should have the Upload Date filter tags', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('1st January 2000')

            element = document.querySelector('#view-permit-documents-tags-row-2-tag-2')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('1st January 2020')
          })
        })

        describe('Tag removal - Document Types', () => {
          beforeEach(async () => {
            postOptions.payload.permitNumber = 'ABC123'
            postOptions.payload.documentTypes = ['General', 'Inpsection', 'Waste Returns']

            postOptions.payload.clickedItem = 'Inpsection'
            postOptions.payload.clickedItemIndex = '2'
            postOptions.payload.clickedRow = 'Document types'

            response = await TestHelper.submitPostRequest(server, postOptions, 200)
            document = await TestHelper.getDocument(response)
          })

          it('should be able to remove a v Type filter tag when the tag has been clicked on', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-1')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('General')

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-2')
            expect(element).toBeTruthy()
            expect(TestHelper.getTextContent(element)).toEqual('Waste Returns')

            element = document.querySelector('#view-permit-documents-tags-row-1-tag-3')
            expect(element).toBeFalsy()
          })
        })

        describe('Tag removal - Uploaded after', () => {
          beforeEach(async () => {
            postOptions.payload.permitNumber = 'ABC123'
            postOptions.payload.documentTypes = ['General', 'Inpsection', 'Waste Returns']
            postOptions.payload['uploaded-after'] = '2000'

            postOptions.payload.clickedItem = '1st January 2000'
            postOptions.payload.clickedItemIndex = '1'
            postOptions.payload.clickedRow = 'Uploaded after'

            response = await TestHelper.submitPostRequest(server, postOptions, 200)
            document = await TestHelper.getDocument(response)
          })

          it('should have removed the "Uploaded after" filter tag', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
            expect(element).toBeFalsy()
          })
        })

        describe('Tag removal - Uploaded before', () => {
          beforeEach(async () => {
            postOptions.payload.permitNumber = 'ABC123'
            postOptions.payload.documentTypes = ['General', 'Inpsection', 'Waste Returns']
            postOptions.payload['uploaded-before'] = '2020'

            postOptions.payload.clickedItem = '1st January 2020'
            postOptions.payload.clickedItemIndex = '1'
            postOptions.payload.clickedRow = 'Uploaded before'

            response = await TestHelper.submitPostRequest(server, postOptions, 200)
            document = await TestHelper.getDocument(response)
          })

          it('should have removed the "Uploaded before" filter tag', async () => {
            let element = document.querySelector('#view-permit-documents-tags')
            expect(element).toBeTruthy()

            element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
            expect(element).toBeFalsy()
          })
        })
      })

      describe('Tag removal - Uploaded between', () => {
        beforeEach(() => {
          postOptions.payload.permitNumber = 'ABC123'
          postOptions.payload.documentTypes = ['General', 'Inpsection', 'Waste Returns']
          postOptions.payload['uploaded-after'] = '2000'
          postOptions.payload['uploaded-before'] = '2020'
        })

        it('should have removed the "Uploaded after" filter tag', async () => {
          postOptions.payload.clickedItem = '1st January 2000'
          postOptions.payload.clickedItemIndex = '1'
          postOptions.payload.clickedRow = 'Uploaded after'

          response = await TestHelper.submitPostRequest(server, postOptions, 200)

          document = await TestHelper.getDocument(response)

          let element = document.querySelector('#view-permit-documents-tags')
          expect(element).toBeTruthy()

          element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('1st January 2020')

          element = document.querySelector('#view-permit-documents-tags-row-2-tag-2')
          expect(element).toBeFalsy()
        })

        it('should have removed the "Uploaded before" filter tag', async () => {
          postOptions.payload.clickedItem = '1st January 2020'
          postOptions.payload.clickedItemIndex = '1'
          postOptions.payload.clickedRow = 'Uploaded before'

          response = await TestHelper.submitPostRequest(server, postOptions, 200)

          document = await TestHelper.getDocument(response)

          let element = document.querySelector('#view-permit-documents-tags')
          expect(element).toBeTruthy()

          element = document.querySelector('#view-permit-documents-tags-row-2-tag-1')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('1st January 2000')

          element = document.querySelector('#view-permit-documents-tags-row-2-tag-2')
          expect(element).toBeFalsy()
        })
      })
    })

    describe('Failure', () => {
      describe('View Permit Details page', () => {
        it('should show validation error when the "Uploaded after" date is invalid', async () => {
          postOptions.payload.permitNumber = 'ABC123'
          postOptions.payload['uploaded-after'] = 'XXXXX'
          postOptions.payload['uploaded-before'] = '2000'
          response = await TestHelper.submitPostRequest(server, postOptions, 200)
          document = await TestHelper.getDocument(response)

          const element = document.querySelector('#uploaded-after-error')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Error: Enter a real date')
        })

        it('should show validation error when the "Uploaded before" date is invalid', async () => {
          postOptions.payload.permitNumber = 'ABC123'
          postOptions.payload['uploaded-after'] = '2000'
          postOptions.payload['uploaded-before'] = 'XXXXX'
          response = await TestHelper.submitPostRequest(server, postOptions, 200)
          document = await TestHelper.getDocument(response)

          const element = document.querySelector('#uploaded-before-error')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Error: Enter a real date')
        })

        it('should show validation error when "Uploaded before" is before "Uploaded after"', async () => {
          postOptions.payload.permitNumber = 'ABC123'
          postOptions.payload['uploaded-after'] = '2000'
          postOptions.payload['uploaded-before'] = '1995'
          response = await TestHelper.submitPostRequest(server, postOptions, 200)
          document = await TestHelper.getDocument(response)

          const element = document.querySelector('#uploaded-before-error')
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Error: "Uploaded before" must be later than "Uploaded after"'
          )
        })
      })
    })
  })
})
