"use client"

import { useState } from "react"
import OnboardingPage from "./components/onboarding-page"
import ResultsPage from "./components/results-page"

export default function ESGOnboarding() {
  const [currentPage, setCurrentPage] = useState<"onboarding" | "results">("onboarding")
  const [esgValues, setEsgValues] = useState({
    environment: 33,
    social: 33,
    governance: 34,
  })
  const [investmentStyle, setInvestmentStyle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState("")

  const handleSliderChange = (category: "environment" | "social" | "governance", newValue: number) => {
    const otherCategories = Object.keys(esgValues).filter((key) => key !== category) as Array<keyof typeof esgValues>
    const remainingValue = 100 - newValue
    const currentOtherTotal = esgValues[otherCategories[0]] + esgValues[otherCategories[1]]

    if (currentOtherTotal === 0) {
      setEsgValues({
        ...esgValues,
        [category]: newValue,
        [otherCategories[0]]: remainingValue / 2,
        [otherCategories[1]]: remainingValue / 2,
      })
    } else {
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

  const handleSubmit = async () => {
    const requestBody = {
      user_style:
        investmentStyle === "aggressive"
          ? "공격적"
          : investmentStyle === "neutral"
          ? "중립적"
          : "보수적",
      env: esgValues.environment,
      soc: esgValues.social,
      gov: esgValues.governance,
      source: "뉴스, 공시",
    }

    try {
      setIsLoading(true)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`)
      }

      const data = await response.json()

      setApiResponse(data.result)
      setCurrentPage("results")
    } catch (error) {
      console.error("처리 오류:", error)
      alert("분석 중 오류가 발생했습니다. 다시 시도해 주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = investmentStyle !== ""

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
