sap.ui.define([
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Input",
  "sap/m/Label",
  "sap/m/Text",
  "sap/m/VBox",
  "sap/m/Image",
  "sap/m/MessageToast",
  "sap/ui/core/library"
], function (MessageBox, Dialog, Button, Input, Label, Text, VBox, Image, MessageToast, coreLib) {
  "use strict";

  var ValueState = coreLib.ValueState;

  return {
    onPayAllFines: function () {
      var that = this;
      var oModel = this.getModel();

      // Show busy indicator while loading summary
      sap.ui.core.BusyIndicator.show(0);

      // Fetch summary: total amount, QR code, UPI ID
      var oSummary = oModel.bindContext("/getPendingFinesSummary()");
      oSummary.requestObject().then(function (oResult) {
        sap.ui.core.BusyIndicator.hide();
        var totalAmount = oResult.totalAmount || 0;
        var fineCount = oResult.fineCount || 0;
        var qrCode = oResult.qrCode || "";
        var upiId = oResult.upiId || "";

        if (fineCount === 0) {
          MessageBox.information("No pending fines to pay.");
          return;
        }

        var aContent = [];

        // Total amount header
        aContent.push(new Text({
          text: "Total Pending: \u20b9" + parseFloat(totalAmount).toFixed(2) + " (" + fineCount + " fine" + (fineCount > 1 ? "s" : "") + ")"
        }).addStyleClass("sapUiSmallMarginBottom sapUiTinyMarginTop"));

        // QR code image
        if (qrCode) {
          aContent.push(new Image({
            src: qrCode,
            width: "200px",
            height: "200px",
            decorative: false,
            alt: "Payment QR Code"
          }).addStyleClass("sapUiSmallMarginBottom"));
        }

        // UPI ID
        if (upiId) {
          aContent.push(new Text({
            text: "UPI ID: " + upiId
          }).addStyleClass("sapUiSmallMarginBottom"));
        }

        // Payment reference input
        var oRefInput = new Input({ placeholder: "e.g. UPI-123456789", width: "100%" });
        aContent.push(new Label({ text: "Payment Reference", required: true }));
        aContent.push(oRefInput);

        var oDialog = new Dialog({
          title: "Pay All Pending Fines",
          type: "Message",
          contentWidth: "24rem",
          content: new VBox({ items: aContent }).addStyleClass("sapUiSmallMargin"),
          beginButton: new Button({
            text: "Confirm Payment",
            type: "Emphasized",
            press: function () {
              var sRef = oRefInput.getValue().trim();
              if (!sRef) {
                oRefInput.setValueState(ValueState.Error);
                oRefInput.setValueStateText("Payment reference is required");
                return;
              }

              oDialog.setBusy(true);
              var oAction = oModel.bindContext("/payAllFines(...)");
              oAction.setParameter("payment_reference", sRef);
              oAction.invoke().then(function () {
                oDialog.setBusy(false);
                MessageToast.show(fineCount + " fines totalling \u20b9" + parseFloat(totalAmount).toFixed(2) + " paid. Awaiting verification.");
                oDialog.close();
                if (that.getExtensionAPI) {
                  that.getExtensionAPI().refresh();
                } else {
                  oModel.refresh();
                }
              }).catch(function (oError) {
                oDialog.setBusy(false);
                MessageBox.error(oError.message || "Failed to pay fines.");
              });
            }
          }),
          endButton: new Button({
            text: "Cancel",
            press: function () {
              oDialog.close();
            }
          }),
          afterClose: function () {
            oDialog.destroy();
          }
        });

        oDialog.open();
      }).catch(function (oError) {
        sap.ui.core.BusyIndicator.hide();
        MessageBox.error(oError.message || "Failed to load fine summary.");
      });
    }
  };
});
