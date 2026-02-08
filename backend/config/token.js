import jwt from "jsonwebtoken"

export const genToken = async (userId) => {
  try {
    let token = await jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "8h" })
    return token
  } catch (error) {
    throw new Error("Token generation failed")
  }
}

export const genToken1 = async (email) => {
  try {
    let token = await jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "8h" })
    return token
  } catch (error) {
    throw new Error("Token generation failed")
  }
}
