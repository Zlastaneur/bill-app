/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import { formatDate, formatStatus } from "../app/format.js"

describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.className).toEqual("active-icon")
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })
    describe("When I click on eye icon of a bill row", () => {
      test("Then modal should appear", async () => {
        // Dom configuration
        document.body.innerHTML = BillsUI({ data: bills })

        // Bills instance Initialisation
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const billsInstance = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        })

        // Simulate eye click
        const iconEye = screen.getAllByTestId("icon-eye")[0]
        $.fn.modal = jest.fn() // Modal function mocking
        const handleClickIconEye = jest.fn(() =>
          billsInstance.handleClickIconEye(iconEye)
        )
        iconEye.addEventListener("click", handleClickIconEye)
        userEvent.click(iconEye)

        // Verification
        expect(handleClickIconEye).toHaveBeenCalled()
        expect($.fn.modal).toHaveBeenCalledWith("show")
      })
    })
    test("When I click on 'New Bill', I should be redirected to the new bill form", async () => {
      document.body.innerHTML = BillsUI({ data: bills })

      // Mocking onNavigate function
      const onNavigate = jest.fn()

      // Initialisation of the Bills instance
      const billsInstance = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })

      // Simulate click on "New Bill" button
      const buttonNewBill = screen.getByTestId("btn-new-bill")
      const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill)
      buttonNewBill.addEventListener("click", handleClickNewBill)
      userEvent.click(buttonNewBill)

      // Verifications
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"])
    })
    test("The getBills method should retrieve and format the bills", async () => {
      // Mock data
      const mockBills = [
        {
          id: "1",
          date: "2023-01-01",
          status: "pending",
        },
        {
          id: "2",
          date: "2023-02-01",
          status: "accepted",
        },
      ]

      // Mock store
      const mockStore = {
        bills: () => ({
          list: jest.fn().mockResolvedValue(mockBills),
        }),
      }

      // Initialisation of the Bills instance
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      })

      // Call the getBills method
      const bills = await billsInstance.getBills()

      // Verifications
      expect(bills.length).toBe(2)
      expect(bills[0].date).toBe(formatDate(mockBills[0].date))
      expect(bills[0].status).toBe(formatStatus(mockBills[0].status))
    })
  })

})
