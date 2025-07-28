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

  const handleSliderChange = (
    category: "environment" | "social" | "governance",
    newValue: number
  ) => {
    const oldValue = esgValues[category]
    const delta = newValue - oldValue
    const otherCategories = Object.keys(esgValues).filter(
      (key) => key !== category
    ) as Array<keyof typeof esgValues>

    let newEsgValues = { ...esgValues }

    if (delta === 0) return 

    if (delta > 0) {
      let remainingToReduce = delta

      const othersSorted = otherCategories.sort(
        (a, b) => esgValues[b] - esgValues[a]
      )

      for (const cat of othersSorted) {
        const canReduce = newEsgValues[cat] 
        const reduceAmount = Math.min(canReduce, remainingToReduce)
        newEsgValues[cat] -= reduceAmount
        remainingToReduce -= reduceAmount

        if (remainingToReduce <= 0) break
      }

      if (remainingToReduce > 0) {
        newValue -= remainingToReduce
      }

      newEsgValues[category] = newValue
    } else {
      // 내리는 경우: 남은 두 항목에 비율대로 나눠 더함
      const increaseAmount = -delta
      const otherSum = otherCategories.reduce(
        (sum, cat) => sum + newEsgValues[cat],
        0
      )

      if (otherSum === 0) {
        otherCategories.forEach((cat) => {
          newEsgValues[cat] += Math.round(increaseAmount / 2)
        })
      } else {
        otherCategories.forEach((cat) => {
          const ratio = newEsgValues[cat] / otherSum
          newEsgValues[cat] += Math.round(increaseAmount * ratio)
        })
      }

      newEsgValues[category] = newValue
    }

    // 총합이 100이 아니면 가장 큰 값에 오차 보정
    const total =
      newEsgValues.environment + newEsgValues.social + newEsgValues.governance
    if (total !== 100) {
      const maxKey = (Object.keys(newEsgValues) as Array<
        keyof typeof newEsgValues
      >).reduce((a, b) =>
        newEsgValues[a] > newEsgValues[b] ? a : b
      )
      newEsgValues[maxKey] += 100 - total
    }

    setEsgValues(newEsgValues)
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

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
