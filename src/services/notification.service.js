'use strict'

const { v4: uuidv4 } = require('uuid')
const { logger } = require('defra-logging-facade')

const config = require('../config/config')

const NotifyClient = require('notifications-node-client').NotifyClient
let notifyClient

class NotificationService {
  _initialise () {
    notifyClient = new NotifyClient(config.govNotifyKey)
    this.isInitialised = true
  }

  sendCustomerEmail (customerEmail, documentRequestDetail) {
    this._sendMessage(config.customerEmailTemplateId, customerEmail, documentRequestDetail)
  }

  sendNcccEmail (customerEmail, documentRequestDetail) {
    this._sendMessage(config.ncccEmailTemplateId, customerEmail, documentRequestDetail)
  }

  async _sendMessage (templateId, emailAddress, documentRequestDetail) {
    if (!this.isInitialised) {
      this._initialise()
    }
    const personalisation = {
      message: documentRequestDetail,
      timescale: config.documentRequestTimescale
    }
    const reference = uuidv4()
    const emailReplyToId = null
    try {
      logger.info(
        `Sending document request ID: ${reference} to email ${emailAddress} using template ID ${templateId} request: ${documentRequestDetail}`
      )
      const response = await notifyClient.sendEmail(templateId, emailAddress, {
        personalisation,
        reference,
        emailReplyToId
      })
      return response
    } catch (error) {
      logger.error(`Error sending message ${reference}`, error)
    }
  }
}

module.exports = NotificationService
