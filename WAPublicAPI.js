/*This script is a modified version of the original by Wild Apricot found here: https://rawgit.com/WildApricot/ApiSamples/master/JavaScript/waPublicApi.js
    The changes involve changing the API to the publicview api v1 for the contacts/me?includeDetails=true call
    Note that the change to the publicview api may have broken other calls found in this js file (we are only using this for contacts/me at the moment)
*/
// this script requiresString jQuery


function WApublicApi(clientId) {
    /**
    * WApublicApi is a thin wrapper around jQuery $.ajax, which helps to access wild apricot public api.
    * @clientId {String} is a valid client application ID. See https://help.wildapricot.com/display/DOC/Authenticating+API+access+from+a+Wild+Apricot+site+page for details.
    */

    if (typeof (clientId) === "undefined" || clientId === null) {
        throw "clientId is required to work with public api";
    }
    this._initialized = false;
    this.clientId = clientId;
    this.apiRequest = function (params) {
        /**
        * Starts ajax request to api. returns result of $.ajax execution (request object)
        * @params {Object} required parameter, with following fields
        *      apiUrl {String} - url of api call. use api.apiUrls to get valid urls
        *      data {Object} - optional parameters for POST and PUT requests
        *      method {String} - http method, if not specified GET will be used
        *      success {function} - callback on successfull call completion, syntax similar to jQuery ajax success callback
        *      error {function} - callback on error call completion, syntax similar to jQuery ajax error callback
        */
        if (!this._initialized) {
            throw "api client is not initialized yet. Please call init() before usaing api. Ex: $.when(api.init()).done(function(){  api.apiRequest(...); });";
        }

        var data = "";
        if (typeof (params.data) === "undefined" || params.data === null) {
            data = null;
        }
        else if (typeof (params.data) === "string") {
            data = params.data;
        }
        else {
            data = JSON.stringify(params.data);
        }

        return $.ajax({
            url: params.apiUrl,
            type: params.method || "GET",
            dataType: "json",
            cache: false,
            headers: { "clientId": this.clientId },
            success: params.success || function () { },
            error: params.error || function () { },
            data: data,
            contentType: "application/json"
        });
    };

    this.apiUrls = {
        accountId: -1,
        baseApiUrl: '/sys/api/publicview', //Added publicview for non-admin use
        account: function () { return this.baseApiUrl + '/v1/accounts/' + this.accountId; }, //Switched from v2 to v1 for publicview api
        me: function () {
            /**
            * contacts/me api call. Returns basic information on current logged in user
            */
            return this.account() + '/contacts/me';
        },
        meDetails: function () {
            /**
            * contacts/me with details api call and is the only method of a non-admin getting details on themselves. 
            * Returns basic and detailed information. 
            * Detailed information is embedded in an array of FieldValues as per accounts/{accountId}/contacts/{contactId} documentation found here:
            * https://app.swaggerhub.com/apis/WildApricot/wild-apricot_api_for_non_administrative_access/1.0.0#/Contacts/get_accounts__accountId__contacts__contactId_
            */
            return this.account() + '/contacts/me?includeDetails=true';
        },
        contact: function (contactId) {
            /**
            * specific contact api call  (https://help.wildapricot.com/display/DOC/Contacts+API+V2+call#ContactsAPIV2call-Retrievinginformationforaspecificcontact)
            * use this url to GET, PUT, DELETE contact
            * @contactId {Number}
            */
            return this.account() + '/contacts/' + contactId;
        },
        contacts: function (params) {
            /**
            * contacts api call with optional params (http://help.wildapricot.com/display/DOC/Contacts+API+V2+call)
            * use this url to list contacts or to POST new one
            * @params {Object} other params supported by contacts api: simpleQuery, $async, $top, $skip, $filter
            */

            params = params || {};

            if (typeof (params.$async) == 'undefined' || params.$async === null) {
                params.$async = false;
            }

            var result = this.account() + '/contacts';

            return result + "?" + $.param(params);
        },
        event: function (eventId) {
            /**
            * specific event api call  (https://help.wildapricot.com/display/DOC/Events+API+V2+call#EventsAPIV2call-Retrievinginformationforaparticularevent)
            * @eventId {Number}
            */
            return this.account() + '/events/' + eventId;
        },
        events: function (params) {
            /**
             * events api call with optional params (http://help.wildapricot.com/display/DOC/Events+API+V2+call)
             * @params {Object} other params supported by events api: simpleQuery, $top, $skip, $filter, includeEventDetails
             */

            params = params || {};
            var result = this.account() + '/events';
            return result + "?" + $.param(params);
        },
        registration: function (eventRegistrationId) {
            /**
             * particular event registration api call (https://help.wildapricot.com/display/DOC/EventRegistrations+API+V2+call#EventRegistrationsAPIV2call-Retrievingeventregistrationdetails)
             * use this url to GET, PUT, DELETE particular registration
             */
            return this.account() + '/eventregistrations/' + eventRegistrationId;
        },
        registrations: function (params) {
            /**
             * event registrations api call with optional params (https://help.wildapricot.com/display/DOC/EventRegistrations+API+V2+call)
             * use this url to list registrations or to POST a new one
             * @params {Object} params supported by event registrations api: contactId, eventId, $filter
             *                  at least one of these parameters should be passed
             */
            return this.account() + '/eventregistrations?' + $.param(params);
        },
        contactFields: function () {
            /**
             * contact fields api call (https://help.wildapricot.com/display/DOC/ContactFields+API+V2+call)
             */
            return this.account() + '/contactFields';
        },
        invoice: function (invoiceId) {
            /**
             * particular invoice api call (https://help.wildapricot.com/display/DOC/Invoices+API+V2+call#InvoicesAPIV2call-Retrievinginformationforaparticularinvoice)
             * @invoiceId {Number}
             */
            return this.account() + '/invoices/' + invoiceId;
        },
        invoices: function (params) {
            /**
             * invoices api call with optional params (https://help.wildapricot.com/display/DOC/Invoices+API+V2+call)
             * @params {Object} params supported by invoices api: contactId, eventId
             *                  at least one of these parameters should be passed
             */
            return this.account() + '/invoices?' + $.param(params);
        },
        payment: function (paymentId) {
            /**
            * particular payment api call (https://help.wildapricot.com/display/DOC/Payments+API+V2+call)
            * @params {Object} params supported by payments api: contactId, eventId
            *                  at least one of these parameters should be passed
            */
            return this.account() + '/payments/' + paymentId;
        },
        payments: function (params) {
            /**
            * payments api call with optional params (https://help.wildapricot.com/display/DOC/Payments+API+V2+call)
            * @params {Object} params supported by payments api: contactId, eventId
            *                  at least one of these parameters should be passed
            */
            return this.account() + '/payments?' + $.param(params);
        },
        tenders: function () {
            /**
            * tenders api call (https://help.wildapricot.com/display/DOC/Tenders+API+V2+call)
            */
            return this.account() + '/tenders';
        }
    };

    this._onInitSucceed = function (data, textStatus, jqXhr) {
        if (data == null) return;
        this.accountId = data[0].Id;
        this.apiUrls.accountId = this.accountId;
        this._initialized = true;
    };

    this.init = function () {
        return $.ajax({
            url: "/sys/api/v2/accounts",
            type: "GET",
            dataType: "json",
            cache: false,
            headers: { "clientId": this.clientId },
            success: this._onInitSucceed,
            error: function (jqXHR, textStatus, errorThrown) {
                throw { status: textStatus, internalError: errorThrown };
            },
            context: this
        });
    };
}
