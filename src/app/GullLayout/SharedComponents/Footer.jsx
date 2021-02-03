import React, { Fragment } from "react";

const Footer = () => {
  return (
    <Fragment>
      <div className="flex-grow-1"></div>
      <div className="app-footer">
        <div className="row">
          <div className="col-md-9">
            <p>
              <strong>ForeKarst - <em>Budget Management Portal</em></strong>
            </p>
            <p>
              Intuitive budget capture;
              Versioning;
              Expense tracking (accounting systems' integrations);
              Dynamic workflows (configurable approval stages);
              Audit trail;
              Reporting/graphical analytics;
              Multiple simultaneous cycles (projections);
              Active Directory (optional)
            </p>
          </div>
        </div>
        <div className="footer-bottom border-top pt-3 d-flex flex-column flex-sm-row align-items-center">
          <a
            id="contact-ForeKarst"
            className="btn btn-primary text-white btn-rounded"
            href="mailto:ehirim.emeka.e@gmail.com"


            onclick={(e)=>e.preventDefault()}
            rel="noopener noreferrer"
          >
             ForeKarst &#8482;
          </a>
          <span className="flex-grow-1"></span>
          <div className="d-flex align-items-center">
            <img className="logo" src="/assets/images/logo.png" alt="" />
            <div>
              <p className="m-0">&copy; 2021 ForeKarst <b>BMP</b></p>
              {/* <p className="m-0">All rights reserved</p> */}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Footer;
