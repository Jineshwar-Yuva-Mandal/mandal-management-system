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
  "sap/ui/core/library",
  "sap/ui/core/BusyIndicator"
], function (MessageBox, Dialog, Button, Input, Label, Text, VBox) {
  "use strict";

  const deps = Array.prototype.slice.call(arguments, 7);
  const Image = deps[0], MessageToast = deps[1], coreLib = deps[2], BusyIndicator = deps[3];
  const ValueState = coreLib.ValueState;

  function _buildContent(totalAmount, fineCount, qrCode, upiId, oRefInput) {
    const aContent = [
      new Text({
        text: "Total Pending: \u20b9" + Number.parseFloat(totalAmount).toFixed(2) + " (" + fineCount + " fine" + (fineCount > 1 ? "s" : "") + ")"
      }).addStyleClass("sapUiSmallMarginBottom sapUiTinyMarginTop")
    ];

    if (qrCode) {
      aContent.push(new Image({
        src: qrCode,
        width: "200px",
        height: "200px",
        decorative: false,
        alt: "Payment QR Code"
      }).addStyleClass("sapUiSmallMarginBottom"));
    }

    if (upiId) {
      aContent.push(new Text({
        text: "UPI ID: " + upiId
      }).addStyleClass("sapUiSmallMarginBottom"));
    }

    aContent.push(
      new Label({ text: "Payment Reference", required: true }),
      oRefInput
    );

    return aContent;
  }

  function _handleConfirm(oDialog, oRefInput, oModel, fineCount, totalAmount, extensionCtx) {
    const sRef = oRefInput.getValue().trim();
    if (!sRef) {
      oRefInput.setValueState(ValueState.Error);
      oRefInput.setValueStateText("Payment reference is required");
      return;
    }

    oDialog.setBusy(true);
    const oAction = oModel.bindContext("/payAllFines(...)");
    oAction.setParameter("payment_reference", sRef);
    oAction.invoke().then(function () {
      oDialog.setBusy(false);
      MessageToast.show(fineCount + " fines totalling \u20b9" + Number.parseFloat(totalAmount).toFixed(2) + " paid. Awaiting verification.");
      oDialog.close();
      if (extensionCtx) {
        extensionCtx.refresh();
      } else {
        oModel.refresh();
      }
    }).catch(function (oError) {
      oDialog.setBusy(false);
      MessageBox.error(oError.message || "Failed to pay fines.");
    });
  }

  function _showPayDialog(oModel, oResult, extensionCtx) {
    const totalAmount = oResult.totalAmount || 0;
    const fineCount = oResult.fineCount || 0;
    const qrCode = oResult.qrCode || "";
    const upiId = oResult.upiId || "";

    if (fineCount === 0) {
      MessageBox.information("No pending fines to pay.");
      return;
    }

    const oRefInput = new Input({ placeholder: "e.g. UPI-123456789", width: "100%" });
    const aContent = _buildContent(totalAmount, fineCount, qrCode, upiId, oRefInput);

    const oDialog = new Dialog({
      title: "Pay All Pending Fines",
      type: "Message",
      contentWidth: "24rem",
      content: new VBox({ items: aContent }).addStyleClass("sapUiSmallMargin"),
      beginButton: new Button({
        text: "Confirm Payment",
        type: "Emphasized",
        press: function () {
          _handleConfirm(oDialog, oRefInput, oModel, fineCount, totalAmount, extensionCtx);
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
  }

  return {
    onPayAllFines: function () {
      const oModel = this.getModel();
      const extensionCtx = this.getExtensionAPI ? this.getExtensionAPI() : null;

      BusyIndicator.show(0);

      const oSummary = oModel.bindContext("/getPendingFinesSummary()");
      oSummary.requestObject().then(function (oResult) {
        BusyIndicator.hide();
        _showPayDialog(oModel, oResult, extensionCtx);
      }).catch(function (oError) {
        BusyIndicator.hide();
        MessageBox.error(oError.message || "Failed to load fine summary.");
      });
    }
  };
});
