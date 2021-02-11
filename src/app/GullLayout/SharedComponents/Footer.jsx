import React, { Fragment } from "react";
import jwtAuthService from "app/services/jwtAuthService";

const Footer = () => {
  const { PRIMARY_COLOR, SECONDARY_COLOR, COMPANY_NAME, PURCHASE_YEAR } = jwtAuthService.getAppSettings() || {};
  return (
    <Fragment>
      <div className="flex-grow-1"></div>
      <div className="app-footer">
        <div className="row">
          <div className="col-md-9">
            <p>
              <strong>{COMPANY_NAME} - <em>Budget Management Portal</em></strong>
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
            className="btn text-white btn-rounded"
            href="mailto:ehirim.emeka.e@gmail.com"
            onClick={(e)=>e.preventDefault()}
            rel="noopener noreferrer"
            style={{backgroundColor:PRIMARY_COLOR}}
          >
             {COMPANY_NAME} &#8482;
          </a>
          <span className="flex-grow-1"></span>
          <div className="d-flex align-items-center">
            <img className="logo" src="/assets/images/logo.png" alt="" />
            <div>
              <p className="m-0">&copy; {PURCHASE_YEAR} {COMPANY_NAME} <b>BMP</b></p>
              {/* <p className="m-0">All rights reserved</p> */}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Footer;
