import { useEffect, useRef, useState } from 'react'

import { getAuthToken } from '../services/authToken'
import { saveUrgentReview } from '../services/safetyReviews'

function initialState() {
  return {
    status: 'idle',
    predictionId: null,
  }
}

export function useUrgentReviewSave() {
  const [state, setState] = useState(initialState)
  const generation = useRef(0)
  const pending = useRef(null)

  useEffect(() => {
    return () => {
      generation.current += 1
      pending.current?.controller.abort()
      pending.current = null
    }
  }, [])

  function reset() {
    generation.current += 1
    pending.current?.controller.abort()
    pending.current = null
    setState(initialState())
  }

  async function save(text, confirmedCodes, corrections) {
    if (pending.current) return

    const request = {
      generation: ++generation.current,
      token: getAuthToken(),
      controller: new AbortController(),
    }

    pending.current = request

    setState({
      status: 'saving',
      predictionId: null,
    })

    function isCurrentRequest() {
      return (
        generation.current === request.generation &&
        getAuthToken() === request.token
      )
    }

    try {
      const review = await saveUrgentReview(
        text,
        confirmedCodes,
        request.controller.signal,
        corrections,
      )

      if (!isCurrentRequest()) return

      setState({
        status: 'saved',
        predictionId: review.prediction_id,
      })
    } catch (error) {
      if (
        !isCurrentRequest() ||
        error?.code === 'ERR_CANCELED'
      ) {
        return
      }

      setState({
        status: 'error',
        predictionId: null,
      })
    } finally {
      if (pending.current === request) {
        pending.current = null
      }
    }
  }

  return { state, save, reset }
}
