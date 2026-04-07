"use client"

const tiers = [
  {
    tier: 'Tier 1',
    rate: '4€',
    countries: 'Austria, Canada, Norway, Finland, Germany, Spain, Italy, France, United Kingdom, United States, Netherlands, Japan, Portugal, Australia, Hungary, United Kingdom, Czech Republic, Switzerland'
  },
  {
    tier: 'Tier 2',
    rate: '2€',
    countries: 'Cameroon, Mexico, Poland, Russia, Malaysia, Greece, Iceland, South Africa, Ukraine, Slovakia, Nigeria, Mauritius, Estonia, Kazakhstan, Guinea, Belgium, Bulgaria, New Zealand, Denmark, Luxembourg, Sweden, Uzbekistan, Lithuania, Cyprus, Slovenia, Ireland, Georgia, Senegal, Belarus, Croatia, Singapore, Brazil'
  },
  {
    tier: 'Tier 3',
    rate: '1€',
    countries: 'Argentina, Vietnam, India, Turkey, Philippines, Chile, Thailand, Korea, Ghana, Mozambique, Taiwan, Seychelles, Botswana, Hong Kong, Kuwait, Kenya, Romania, United Arab Emirates, Namibia, Sri Lanka, Ethiopia, Colombia, Saudi Arabia, Costa Rica, Israel, Malta, Peru, Dominican Republic, Uruguay, Iran, Madagascar, Qatar, Honduras, Uganda, Myanmar, China, Morocco, Latvia'
  }
]

export default function MoneyRatesPage() {
  return (
    <div className="bg-white">
      {/* Page Title */}
      <h3
        style={{
          display: "inline-block",
          verticalAlign: "top",
          fontSize: "22px",
          fontWeight: "normal",
          color: "rgb(21, 101, 148)",
          marginTop: "0px",
          marginBottom: "24px",
          fontFamily: 'Montserrat, "Open Sans", sans-serif',
        }}
      >
        Payout Rates
      </h3>

      {/* Info Box - Original Design */}
      <div
        className="relative mb-8"
        style={{
          padding: "15px 150px 0px 15px",
          border: "5px solid rgb(233, 243, 249)",
          borderRadius: "10px",
          position: "relative",
          fontSize: "14px",
          boxShadow: "rgba(54, 115, 150, 0.6) 2px 2px 5px",
          margin: "0px",
          fontFamily: 'Montserrat, "Open Sans", sans-serif',
        }}
      >
        {/* SVG Chart - Exact from original */}
        <svg
          viewBox="0 0 26 26"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            fill: "rgb(27, 145, 219)",
            height: "80px",
            position: "absolute",
            right: "40px",
            top: "50%",
            marginTop: "-40px",
            bottom: "0px",
          }}
        >
          <path d="M19.5 26c-0.6 0-1-0.4-1-1V13c0-0.6 0.4-1 1-1h5c0.6 0 1 0.4 1 1v12c0 0.6-0.4 1-1 1H19.5z" />
          <path d="M10.5 26c-0.6 0-1-0.4-1-1V7c0-0.6 0.4-1 1-1h5c0.6 0 1 0.4 1 1v18c0 0.6-0.4 1-1 1H10.5z" />
          <path d="M1.5 26c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h5c0.6 0 1 0.4 1 1v24c0 0.6-0.4 1-1 1H1.5z" />
        </svg>

        {/* Text Content */}
        <p
          style={{
            fontWeight: "normal",
            color: "rgb(21, 101, 148)",
            fontSize: "14px",
            margin: "0px 0px 12px 0px",
            lineHeight: "1.5",
          }}
        >
          <strong style={{ color: "rgb(27, 145, 219)" }}>We compensate</strong> visitors based on their country when accessing your folders. Countries are divided into 3 groups shown here.
        </p>

        <p
          style={{
            fontWeight: "600",
            color: "rgb(21, 101, 148)",
            fontSize: "14px",
            margin: "12px 0px 8px 0px",
          }}
        >
          We count:
        </p>
        <ul
          style={{
            listStyle: "disc",
            color: "rgb(21, 101, 148)",
            fontSize: "14px",
            marginLeft: "20px",
            marginTop: "0px",
            marginBottom: "0px",
            lineHeight: "1.6",
          }}
        >
          <li>per IP once every 8 hours (entire network)</li>
          <li>all users except server IPs, proxies and Tor</li>
          <li>Adblock users with 10% of TKP</li>
        </ul>
      </div>

      {/* Payout Rates Heading */}
      <h2 style={{ fontSize: "22px", fontWeight: "normal", color: "rgb(21, 101, 148)", marginBottom: "24px", marginTop: "32px", fontFamily: 'Montserrat, "Open Sans", sans-serif' }}>Our current payout rates (per 1000)</h2>

      {/* Tier Cards */}
      <ul
        style={{
          listStyle: "none",
          padding: "0px",
          display: "flex",
          width: "100%",
          flexDirection: "row",
          fontFamily: 'Montserrat, "Open Sans", sans-serif',
          gap: "20px",
        }}
      >
        {tiers.map((tier, index) => (
          <li
            key={tier.tier}
            style={{
              fontSize: "14px",
              borderRadius: "10px",
              padding: "30px",
              flex: "1 1 100%",
              background: "linear-gradient(rgb(255, 255, 255) 60%, rgb(233, 243, 249) 100%)",
              position: "relative",
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              marginRight: index === tiers.length - 1 ? "0px" : "20px",
              border: index === 0 ? "4px solid" : index === 1 ? "3px solid" : "2px solid",
              borderColor: "rgb(27, 145, 219)",
              fontFamily: 'Montserrat, "Open Sans", sans-serif',
              marginTop: index === 0 ? "0px" : index === 1 ? "30px" : "60px",
            }}
          >
            {/* Price Badge */}
            <strong
              style={{
                background: "rgb(27, 145, 219)",
                fontWeight: 400,
                fontSize: "30px",
                position: "absolute",
                top: "0px",
                right: "0px",
                width: "58px",
                height: "58px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "rgb(255, 255, 255)",
                borderTopRightRadius: "6px",
                borderBottomLeftRadius: "30px",
                fontFamily: 'Montserrat, "Open Sans", sans-serif',
              }}
            >
              {tier.rate}
            </strong>

            {/* Tier Label */}
            <span
              style={{
                fontWeight: 600,
                fontSize: "18px",
                fontFamily: 'Montserrat, "Open Sans", sans-serif',
                color: "rgb(21, 101, 148)",
              }}
            >
              {tier.tier}
            </span>

            {/* Countries List */}
            <div
              style={{
                fontSize: "14px",
                marginTop: "20px",
                display: "flex",
                lineHeight: "22px",
                letterSpacing: "-0.5px",
                fontFamily: 'Montserrat, "Open Sans", sans-serif',
                color: "rgb(54, 114, 148)",
              }}
            >
              {tier.countries}
            </div>
          </li>
        ))}
      </ul>

      {/* Footer Text */}
      <p className="text-sm text-[#8fa6b5]">Updated on August 12, 2025</p>
    </div>
  )
}

