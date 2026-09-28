import { useState } from "react";
import { useTranslation } from "react-i18next";
import { literacyIcons } from "../../config/constants";

const literacy = {
  banking: [
    ["Savings account", "An account designed for saving money while allowing deposits and withdrawals."],
    ["Current account", "An account generally designed for frequent business transactions."],
    ["Fixed Deposit (FD)", "A fixed deposit keeps money for a chosen period under stated terms and interest."],
    ["Recurring Deposit (RD)", "A recurring deposit involves making regular deposits for a chosen period."],
    ["Credit score", "A credit score is based on credit information and may be considered by lenders."],
  ],
  investments: [
    ["Bond", "A debt instrument where an issuer borrows money under specified repayment terms."],
    ["SIP", "A Systematic Investment Plan allows a fixed amount to be invested periodically in a mutual fund scheme."],
    ["Mutual fund", "A pooled investment vehicle managed according to the objectives of its scheme."],
    ["PPF", "The Public Provident Fund is a government-backed long-term savings scheme."],
    ["Saving vs investing", "Saving generally emphasizes liquidity, while investing generally involves accepting risk for potential returns."],
  ],
  taxes: [
    ["PAN", "Permanent Account Number used for income-tax and other financial purposes."],
    ["ITR", "Income Tax Return used to report relevant income and tax information."],
    ["TDS", "Tax Deducted at Source from certain payments under applicable rules."],
    ["GST", "Goods and Services Tax is an indirect tax framework."],
    ["Assessment year", "The year following a financial year in which income is assessed or returned under applicable rules."],
  ],
  procedures: [
    ["PAN application", "Use an official PAN service, provide the required identity, address and date-of-birth information, and complete verification."],
    ["ITR filing", "Collect relevant income and tax documents, choose the applicable ITR, submit it, verify the return and retain the acknowledgement."],
    ["Open a bank account", "Choose an account, review its requirements, submit KYC documents and complete the bank's verification process."],
    ["Use UPI safely", "Never share OTPs or UPI PINs. Verify the recipient and amount before confirming a payment."],
  ],
  digital: [
    ["UPI", "A digital payment system that supports transfers between participating bank accounts."],
    ["QR payment", "A payment initiated by scanning a QR code and confirming the transaction in a payment application."],
    ["Mobile banking", "Using a bank's mobile application to access supported banking services."],
    ["Internet banking", "Using a bank's website to access supported banking services."],
  ],
};

export default function Literacy() {
  const { t } = useTranslation();
  const [k, setK] = useState("banking");
  const categoryNames = {
    banking: "Banking",
    investments: "Investments",
    taxes: "Taxes",
    procedures: "Financial procedures",
    digital: "Digital finance",
  };

  return (
    <div className="content-page">
      <section className="page-hero literacy-hero">
        <div>
          <span className="eyebrow">LEARN & UNDERSTAND</span>
          <h1>{t("literacy")}</h1>
          <p>Understand common financial terms and everyday financial procedures in simple language.</p>
        </div>
        <div className="hero-icon">📚</div>
      </section>

      <div className="literacy-layout">
        <aside className="literacy-sidebar">
          <h3>Topics</h3>
          {Object.keys(literacy).map((x) => (
            <button key={x} className={`literacy-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>
              <span>{literacyIcons[x]}</span>
              {categoryNames[x]}
              <span className="tab-arrow">→</span>
            </button>
          ))}
        </aside>

        <section className="literacy-content">
          <div className="literacy-heading">
            <span>{literacyIcons[k]}</span>
            <div><span className="eyebrow">TOPIC</span><h2>{categoryNames[k]}</h2></div>
          </div>
          <div className="literacy-cards">
            {literacy[k].map(([title, description], index) => (
              <article className="literacy-card" key={title}>
                <div className="literacy-card-number">{index + 1}</div>
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
