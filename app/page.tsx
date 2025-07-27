"use client"

import { useState } from "react"
import OnboardingPage from "./components/onboarding-page"
import ResultsPage from "./components/results-page"

export default function ESGOnboarding() {
  // 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState<"onboarding" | "results">("onboarding")

  // ESG 슬라이더 상태 (총합 100%)
  const [esgValues, setEsgValues] = useState({
    environment: 33,
    social: 33,
    governance: 34,
  })

  // 투자 성향
  const [investmentStyle, setInvestmentStyle] = useState("")

  // API 관련 상태
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState("")

  // ESG 슬라이더 값 변경 처리
  const handleSliderChange = (category: "environment" | "social" | "governance", newValue: number) => {
    const otherCategories = Object.keys(esgValues).filter((key) => key !== category) as Array<keyof typeof esgValues>
    const remainingValue = 100 - newValue

    // 나머지 두 카테고리에 남은 값을 비례적으로 분배
    const currentOtherTotal = esgValues[otherCategories[0]] + esgValues[otherCategories[1]]

    if (currentOtherTotal === 0) {
      // 다른 값들이 0인 경우 균등 분배
      setEsgValues({
        ...esgValues,
        [category]: newValue,
        [otherCategories[0]]: remainingValue / 2,
        [otherCategories[1]]: remainingValue / 2,
      })
    } else {
      // 기존 비율에 따라 분배
      const ratio1 = esgValues[otherCategories[0]] / currentOtherTotal
      const ratio2 = esgValues[otherCategories[1]] / currentOtherTotal

      setEsgValues({
        ...esgValues,
        [category]: newValue,
        [otherCategories[0]]: Math.round(remainingValue * ratio1),
        [otherCategories[1]]: Math.round(remainingValue * ratio2),
      })
    }
  }

  // 폼 제출 처리 - API 호출
  const handleSubmit = async () => {
    const requestBody = {
      user_style: investmentStyle === "aggressive" ? "공격적" : investmentStyle === "neutral" ? "중립적" : "보수적",
      env: esgValues.environment,
      soc: esgValues.social,
      gov: esgValues.governance,
      source: "뉴스, 공시",
    }

    try {
      setIsLoading(true)

      // 실제 API 호출 (현재는 샘플 응답 사용)
      // TODO: 실제 API 엔드포인트로 교체 필요
      /*
      const response = await fetch("YOUR_API_ENDPOINT_HERE", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("API 호출 실패")
      }

      const data = await response.json()
      setApiResponse(data.result)
      */

      // 현재는 샘플 응답 사용 (실제 API 연결 시 위 코드 사용)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // 2초 로딩 시뮬레이션

      const sampleResponse = `📌 [프롬프트 요약]
사용자는 ${requestBody.user_style} 투자자이며 ESG 비중이 환경 ${requestBody.env}%, 사회 ${requestBody.soc}%, 지배구조 ${requestBody.gov}%입니다. 뉴스, 공시 기반으로 국내 기업 추천을 요청하였습니다.

📌 [ESG 요약 분석]
뉴스와 재무 데이터를 분석한 결과, ESG 측면에서 긍정적인 영향을 미치는 기업들이 다수 확인됩니다. 특히, 친환경 기술 개발 및 재활용, 사회적 책임 프로젝트, 그리고 투명한 경영 구조와 관련된 활동들이 두드러집니다. 이러한 활동들은 기업의 지속 가능성과 재무 안정성에 긍정적인 영향을 미치며, 투자 매력을 높입니다.

💡 [추천 투자 기업]

1. 🏢 이닉스
📌 추천 이유: 이닉스는 전기차 및 2차전지 안전 솔루션 분야에서 선도적인 기술을 보유하고 있으며, 배터리 화재 예방과 관련된 혁신적인 제품으로 시장에서의 경쟁력을 갖추고 있습니다. ESG 관점에서 배터리 안전성 강화는 매우 중요한 요소이며, 이닉스는 이를 충족합니다. 재무적으로도 매출 증가와 함께 이익률 개선이 기대됩니다.

2. 🏢 엘앤에프
📌 추천 이유: 엘앤에프는 양극재 분야에서 글로벌 경쟁력을 보유하고 있으며, 폐기물 매립 제로(ZWTL) 플래티넘 등급을 3년 연속 달성하는 등 환경 친화적 경영을 실천하고 있습니다. ESG 관점에서 매우 긍정적인 평가를 받으며, 재무적으로도 안정적인 수익을 창출하고 있습니다.

3. 🏢 삼성SDI
📌 추천 이유: 삼성SDI는 전기차 배터리 및 ESS(에너지저장시스템) 분야에서 글로벌 선도 기업으로, 친환경 에너지 솔루션을 통해 탄소 중립에 기여하고 있습니다. 지속적인 R&D 투자와 함께 사회적 책임 경영을 실천하고 있어 높은 ESG 점수를 기록하고 있습니다.

📰 [관련 기사 목록]
1. 📄 이닉스, 전기차 배터리 안전 솔루션 선도 기업
🔗 http://www.finomy.com/news/articleView.html?idxno=234780
2. 📄 엘앤에프, 폐기물 매립 제로(ZWTL) 플래티넘 등급 획득
🔗 https://www.cstimes.com/news/articleView.html?idxno=658604
3. 📄 삼성SDI, 친환경 배터리 기술 혁신으로 ESG 경영 선도
🔗 https://www.etnews.com/news/articleView.html?idxno=2024010100001`

      setApiResponse(sampleResponse)
      setCurrentPage("results")
    } catch (error) {
      console.error("처리 오류:", error)
      alert("분석 중 오류가 발생했습니다. 다시 시도해 주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = investmentStyle

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {currentPage === "onboarding" ? (
        <OnboardingPage
          esgValues={esgValues}
          setEsgValues={setEsgValues}
          investmentStyle={investmentStyle}
          setInvestmentStyle={setInvestmentStyle}
          onSubmit={handleSubmit}
          isFormValid={isFormValid}
          isLoading={isLoading}
          handleSliderChange={handleSliderChange}
        />
      ) : (
        <ResultsPage
          userPreferences={{ esgValues, investmentStyle }}
          apiResponse={apiResponse}
          onBack={() => setCurrentPage("onboarding")}
        />
      )}
    </div>
  )
}
