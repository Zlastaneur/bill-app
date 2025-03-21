/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { localStorageMock } from "../__mocks__/localStorage.js"


describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))


  describe("When I am on NewBill Page", () => {
    test("Then download new file should work", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => { document.body.innerHTML = pathname }
      const store = {
        bills: jest.fn(() => ({
          create: jest.fn().mockResolvedValue({ fileUrl: 'url', key: '1234' }),
        })),
      }

      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)

      const file = new File(["(⌐□_□)"], "test.png", { type: "image/png" })
      userEvent.upload(inputFile, file)

      // Check if file upload works
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0]).toStrictEqual(file)
      expect(inputFile.files).toHaveLength(1)
    })
    test("Then form submit should work", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => { document.body.innerHTML = pathname }
      const store = {
        bills: jest.fn(() => ({
          update: jest.fn().mockResolvedValue({}),
        })),
      }

      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })

      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)

      fireEvent.submit(form)

      // Check if form submit works
      expect(handleSubmit).toHaveBeenCalled()
    })

  })
})
