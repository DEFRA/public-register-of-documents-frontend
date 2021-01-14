'use strict'

jest.mock('notifications-node-client')

const NotificationService = require('../../src/services/notification.service')

// Will be needed for Stories 15383 and 15384
// const notifyClientPackage = require('notifications-node-client')
// let NotifyClient

const createMocks = () => {
  // Story 7156 - These tests will be completed once the design has been delivered
  // notifyClientPackage.NotifyClient = {
  //   sendEmail: jest.fn(() => 'sendEmail stub called')
  // }
  // NotifyClient = notifyClientPackage.NotifyClient
  // NotifyClient.sendEmail = jest.fn()
  // applicationinsights.setup = jest.fn(() => applicationinsights)
  // applicationinsights.start = jest.fn()
  // applicationinsights.defaultClient = {
  //   trackEvent: jest.fn(),
  //   trackMetric: jest.fn()
  // }
}

describe('AppInsights service', () => {
  let notificationService

  beforeEach(async () => {
    createMocks()

    notificationService = new NotificationService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialise method', () => {
    it('should only be called once', async () => {
      // expect(notificationService).toBeTruthy()
      // jest.spyOn(notificationService, '_initialise')
      // expect(notificationService._initialise).toBeCalledTimes(0)
      // notificationService.sendMessage()
      // expect(notificationService._initialise).toBeCalledTimes(1)
      // notificationService.sendMessage()
      // expect(notificationService._initialise).toBeCalledTimes(1)
    })
  })

  // Story 7156 - These tests will be completed once the design has been delivered
  describe('sendMessage method', () => {
    it('should call the Notify sendEmail method', async () => {
      expect(notificationService).toBeTruthy()

      // expect(NotifyClient.sendEmail).toBeCalledTimes(0)
      // notificationService.sendMessage()
      // expect(NotifyClient.sendEmail).toBeCalledTimes(1)
    })
  })
})
