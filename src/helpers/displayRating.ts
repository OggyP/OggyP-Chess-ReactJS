import { userInfo } from './verifyToken';

function displayRating(user: { rating: number, ratingDeviation?: number }) {
    if (user.ratingDeviation)
        return `${Math.round(user.rating)}${(user.ratingDeviation > 100) ? '?' : ''}`
    else
        return user.rating.toString()
}

export default displayRating