import { expect, test } from '@playwright/test'
import { LoginDTO } from './dto/LoginDTO'
import { OrderDTO } from './dto/OrderDTO'
import { StatusCodes } from 'http-status-codes'

const BASE_URL = 'https://backend.tallinn-learning.ee'

test('login and create order', async ({ request }) => {
  console.log('Requesting jwt...')
  const authResponse = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData(),
  })
  expect(authResponse.status()).toBe(StatusCodes.OK)

  const jwt = await authResponse.text()

  console.log('Creating new order...')
  const orderResponse = await request.post(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    data: OrderDTO.createOrderWithRandomData(),
  })
  expect(orderResponse.status()).toBe(StatusCodes.OK)

  const orderJson = await orderResponse.json()
  const orderId = orderJson.id

  console.log('Created order ID:', orderId)
  expect(orderId).toBeDefined()

  console.log('Getting orders...')
  const getOrdersResponse = await request.get(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(getOrdersResponse.status()).toBe(StatusCodes.OK)

  const orders = await getOrdersResponse.json()
  console.log('Orders:', orders)

  expect(orders.length).toBeGreaterThan(0)
  expect(orders.some((order: OrderDTO) => order.id === orderId)).toBeTruthy()
})

test('authorization, creating order and deleting order by ID', async ({ request }) => {
  const authResponse = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData(),
  })
  expect(authResponse.status()).toBe(StatusCodes.OK)
  const jwt = await authResponse.text()

  const { id: _ignoredId, ...orderData } = OrderDTO.createOrderWithRandomData()

  const createResponse = await request.post(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    data: orderData,
  })
  expect(createResponse.status()).toBe(StatusCodes.OK)

  const created = await createResponse.json()
  const orderId = created.id
  expect(orderId).toBeDefined()

  const deleteResponse = await request.delete(`${BASE_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(deleteResponse.status()).toBe(StatusCodes.OK)

  const getResponse = await request.get(`${BASE_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  if (getResponse.status() === StatusCodes.OK) {
    const body = await getResponse.text()
    expect(body === '' || body === 'null' || body === '{}').toBeTruthy()
  } else {
    expect(getResponse.status()).toBe(StatusCodes.NOT_FOUND)
  }
})
