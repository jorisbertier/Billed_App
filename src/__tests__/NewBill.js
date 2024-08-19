/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
		test("Then, the icon should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')

      const isActive = windowIcon.classList.contains('active-icon')
      expect(isActive).toBeTruthy()
		});
    test('Then, all the form input should be render correctly', async ()=> {
      document.body.innerHTML = NewBillUI({ data: [] });

      const formNewBill = screen.getByTestId('form-new-bill')
      const expenseType = screen.getByTestId('expense-type')

      expect(formNewBill).toBeTruthy()
      expect(expenseType).toBeTruthy()
    })
  })
  describe('When I am on NewBill page, and a user upload a accepted format file', ()=> {
    test('Then, the file format type shoud be png, jpeg || jpg', async ()=> {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage });
      const file = screen.getByTestId('file')

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

      file.addEventListener("change", handleChangeFile)
      // test with format type accepted
      fireEvent.change(file, {
        target: {
          files: [new File(['file.png'], "file.png", {type: 'image/png'})]
        }
      })

      const inputErrorMessage = screen.getByTestId("messageError");

      expect(handleChangeFile).toHaveBeenCalled()
      expect(file.files[0].name).toBe('file.png')
      expect(inputErrorMessage.textContent).toBe('')
      expect(newBill.fileName).toBe(null)

      //test with format type not accepted
      fireEvent.change(file, {
        target: {
          files: [new File(['file.txt'], "file.txt", {type: 'text/plain'})]
        }
      })

      expect(file.files[0].name).not.toBe('file.png')

    })
  })
  describe("When I am on NewBill page, and the user click on submit button", () => {
		test("Then, the handleSubmit function should be called", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage });

      const handleSubmit = jest.fn(newBill.handleSubmit)
      const formNewBill = screen.getByTestId('form-new-bill')

      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)

      expect(handleSubmit).toHaveBeenCalled()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
  
      document.body.innerHTML = NewBillUI();
    })
    test("Add bills from an API and fails with 404 message error", async () => {
      const postSpy = jest.spyOn(console, 'error')

      const store = {
        bills: jest.fn(() => newBill.store), 
        create: jest.fn(() => Promise.resolve({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'})),
        update: jest.fn(() => Promise.reject(new Error('404'))),
      }
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      const formNewBill = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(newBill.handleSubmit)

      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)
      await new Promise(process.nextTick);

      expect(postSpy).toHaveBeenCalledWith(new Error('404'))
    })
    test('Add bills from an API and fails with 500 message error', async ()=> {
    //  Crée un espion sur la méthode console.error pour surveiller les appels à cette méthode. Ceci est utilisé pour vérifier que l'erreur est bien enregistrée dans la console.
    const postSpy = jest.spyOn(console, 'error')

//store: Un objet simulé qui représente le magasin (store) utilisé par newBill
// bills: Une fonction factice (mock) qui retourne newBill.store
// create: Une fonction factice (mock) qui retourne une promesse résolue avec un objet vide
// update: Une fonction factice (mock) qui retourne une promesse rejetée avec une erreur "500". Ceci simule une erreur de serveur lors de la mise à jour.
    const store = {
      bills: jest.fn(() => newBill.store),
      create: jest.fn(() => Promise.resolve({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'})),
      update: jest.fn(() => Promise.reject(new Error('500'))),
    }

    const newBill = new NewBill({ document, onNavigate, store, localStorage });
    const handleSubmit = jest.fn(newBill.handleSubmit)

    const formNewBill = screen.getByTestId('form-new-bill')

    formNewBill.addEventListener('submit', handleSubmit)

    // simule soumission formulaire
    fireEvent.submit(formNewBill)
    // Attend la prochaine "tick" du cycle d'événements Node.js pour s'assurer que toutes les promesses en attente sont résolues
    await new Promise(process.nextTick);

    expect(postSpy).toHaveBeenCalledWith(new Error('500'))
    })
  })
})

