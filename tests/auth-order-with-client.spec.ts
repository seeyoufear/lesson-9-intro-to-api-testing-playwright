import { expect, test } from '@playwright/test'
import { ApiClient } from '../src/ApiClient'
import { StatusCodes } from 'http-status-codes'

test('login and create order with api client', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const orderId = await apiClient.createOrderAndReturnOrderId()
  console.log('orderId:', orderId)
})

test('get orders with api client', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const ordersBefore = await apiClient.getOrders()
  await apiClient.createOrderAndReturnOrderId()
  const ordersAfter = await apiClient.getOrders()

  expect(ordersBefore.length < ordersAfter.length).toBeTruthy()
})

test('delete order with api client', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const orderId = await apiClient.createOrderAndReturnOrderId()
  expect(orderId).toBeDefined()

  const deleteId = await apiClient.deleteOrderById(orderId)
  expect(deleteId).toBe(StatusCodes.OK)

  const getOrderAfterDelete = await apiClient.getOrderById(orderId)
  if (getOrderAfterDelete.status === StatusCodes.OK) {
    expect(getOrderAfterDelete.emptyBody).toBeTruthy()
  } else {
    expect(getOrderAfterDelete.status).toBe(StatusCodes.NOT_FOUND)
  }
})
