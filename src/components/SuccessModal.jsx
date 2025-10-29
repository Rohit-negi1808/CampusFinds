import React, { useEffect } from 'react';

const SuccessModal = ({ reportType, modalRef, isClaim = false, claimData = {} }) => {
    // Dynamic messages
    let titleMessage = '';
    let mainMessage = '';
    let subMessage = '';

    if (isClaim) {
        titleMessage = 'Claim Submitted';
        mainMessage = 'Your claim has been submitted successfully!';
        subMessage = claimData.contact
            ? `The item's owner will be notified and may contact you at ${claimData.contact}.`
            : "The item's owner will be notified and contact you soon.";
    } else {
        titleMessage = reportType === 'lost'
            ? 'Lost Item Report Submitted'
            : 'Found Item Report Submitted';

        mainMessage = reportType === 'lost'
            ? 'Your lost item report has been submitted!'
            : 'Your found item report has been submitted!';

        subMessage = reportType === 'lost'
            ? "We'll notify you if someone finds your item."
            : "We'll notify you if someone claims the item.";
    }

    useEffect(() => {
        // Optional: Bootstrap modal initialization can be handled in parent
    }, [modalRef]);

    return (
        <div className="modal fade" id="successModal" tabIndex="-1" aria-hidden="true" ref={modalRef}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{titleMessage}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="text-center">
                            <i className="fas fa-check-circle text-success mb-3" style={{ fontSize: '4rem' }}></i>
                            <h4>{mainMessage}</h4>
                            <p>{subMessage}</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
