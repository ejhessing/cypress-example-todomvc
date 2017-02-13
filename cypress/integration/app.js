describe('TodoMVC testing with Cypress', () => {
  const TODO_ITEM_ONE = "Get some sleep",
    TODO_ITEM_TWO = "Buy some food",
    TODO_ITEM_THREE = "Have a party";

  beforeEach(() => {
    cy.visit("/");
  });

  context("When page is initially opened", () => {
    it("Should focus on the todo input field", () => {
      cy.focused().should("have.class", "new-todo")
    })
  })

  context("No extra elements on the intial page", () => {
    it("Should not have any Li on page", () => {
      cy.get(".todo-list li").should("not.exist")
    })
    it("Should not have any main on page", () => {
      cy.get(".main").should("not.exist")
    })
    it("Should not have any footer on page", () => {
      cy.get(".footer").should("not.exist")
    })
  })

  context("Add To Do", () => {
    it("It should allow me to add todo Items", () => {
      cy
        .get(".new-todo").type(TODO_ITEM_ONE).type("{enter}")
        .get(".todo-list li").eq(0).find("label").should("contain", TODO_ITEM_ONE)
        .get(".new-todo").type(TODO_ITEM_TWO).type("{enter}")
        .get(".todo-list li").eq(1).find("label").should("contain", TODO_ITEM_TWO)
    })
    it("Should clear text input field when an item is added", () => {
      cy
        .get(".new-todo").type(TODO_ITEM_ONE).type("{enter}").should("have.value", "")
    })

    it("should append new items to the bottom of the list", () => {
      cy
        // this is an example of a custom command
        // which is stored in cypress/support/commands.js
        // you should open up the commands and look at
        // the comments!
        .createDefaultTodos().as("todos")

        // even though the text content is split across
        // multiple <span> and <strong> elements
        // `cy.contains` can verify this correctly
        .get(".todo-count").contains("3 items left")

        .get("@todos").eq(0).find("label").should("contain", TODO_ITEM_ONE)
        .get("@todos").eq(1).find("label").should("contain", TODO_ITEM_TWO)
        .get("@todos").eq(2).find("label").should("contain", TODO_ITEM_THREE)
    })

    it("Should trim text input", () => {
      cy
        .createTodo("     " + TODO_ITEM_TWO + "         ")
        .get(".todo-list li").eq(0).should("have.text", TODO_ITEM_TWO)
    })

    it("Shows main and footer when a todo is created", () => {
      cy
        .createTodo(TODO_ITEM_ONE)
        .get(".main").should("be.visible")
        .get(".footer").should("be.visible")
    })
  })


  context("Mark all as complete", () => {
    beforeEach(() => {
      cy.createDefaultTodos().as("todos")
    })

    it("should allow me to mark all items as completed", () => {
      cy
        .get(".toggle-all").check()
        .get("@todos").eq(0).should("have.class", "completed")
        .get("@todos").eq(1).should("have.class", "completed")
        .get("@todos").eq(2).should("have.class", "completed")
    })

    it("should allow me to clear the complete state of all items", () => {
      cy
        .get(".toggle-all").check().uncheck()
        .get("@todos").eq(0).should("not.have.class", "completed")
        .get("@todos").eq(1).should("not.have.class", "completed")
        .get("@todos").eq(2).should("not.have.class", "completed")
    })
    
    it("complete all checkbox should update state when items are completed / cleared", () => {
      cy
        .get(".toggle-all").as("toggleAll")
          .check().should("be.checked")
        .get(".todo-list li").eq(0).as("firstTodo")
          .find(".toggle")
          .uncheck()
        .get("@toggleAll").should("not.be.checked")
        .get("@firstTodo").find(".toggle").check()
        .get("@toggleAll").should("be.checked")  
    })
  })

  context("Item", () => {
    it("should allow me to mark items as complete", () => {
      cy
        .createTodo(TODO_ITEM_ONE).as("firstTodo")
        .createTodo(TODO_ITEM_TWO).as("secondTodo")

        .get("@firstTodo").find(".toggle").check()
        .get("@firstTodo").should("have.class", "completed")

        .get("@secondTodo").should("not.have.class", "completed")
        .get("@secondTodo").find(".toggle").check()

        .get("@firstTodo").should("have.class", "completed")
        .get("@secondTodo").should("have.class", "completed")
    })

    it("should allow me to un-mark items as complete", () => {
      cy
        .createTodo(TODO_ITEM_ONE).as("firstTodo")
        .createTodo(TODO_ITEM_TWO).as("secondTodo")

        .get("@firstTodo").find(".toggle").check()
        .get("@firstTodo").should("have.class", "completed")
        .get("@secondTodo").should("not.have.class", "completed")

        .get("@firstTodo").find(".toggle").uncheck()
        .get("@firstTodo").should("not.have.class", "completed")
        .get("@secondTodo").should("not.have.class", "completed")
    })
  })

  context("Editing", () => {
    beforeEach(() => {
      cy.createDefaultTodos().as("todos")
    })

    it("Should hide other controls when editing", () => {
      cy
        .get("@todos").eq(1).as("secondTodo")
          .find("label").dblclick()
        .get("@secondTodo").find(".toggle").should("not.be.visible")
        .get("@secondTodo").find("label").should("not.be.visible")
    })

    it("should save edits on blur", () => {
      cy
        .get("@todos").eq(1).as("secondTodo")
          .find("label").dblclick()

        .get("@secondTodo")
          .find(".edit").clear()
          .type("Something else")
          .blur()

        .get("@todos").eq(0).should("contain", TODO_ITEM_ONE)  
        .get("@secondTodo").should("contain", "Something else")
        .get("@todos").eq(2).should("contain", TODO_ITEM_THREE)  

    })

    it("should trim entered text", () => {
      cy
        .get("@todos").eq(1).as("secondTodo")
          .find("label").dblclick()

        .get("@secondTodo")
          .find(".edit").clear()
          .type("                 Something else              ")
          .blur()

        .get("@todos").eq(0).should("contain", TODO_ITEM_ONE)  
        .get("@secondTodo").should("contain", "Something else")
        .get("@todos").eq(2).should("contain", TODO_ITEM_THREE)  

    })

    it("should remove the item if an empty text string was entered", () => {
      cy
        .get("@todos").eq(1).as("secondTodo")
          .find("label").dblclick()

        .get("@secondTodo")
          .find(".edit").clear().type("{enter}")

        .get("@todos").should("have.length", 2)  
    })

    it("should cancel edits on escape", () => {
      cy
        .get("@todos").eq(1).as("secondTodo")
          .find("label").dblclick()

        .get("@secondTodo")
          .find(".edit").clear().type("foo{esc}")

       .get("@todos").eq(0).should("contain", TODO_ITEM_ONE) 
       .get("@todos").eq(1).should("contain", TODO_ITEM_TWO) 
       .get("@todos").eq(2).should("contain", TODO_ITEM_THREE) 
    })

  })


  context("Counter", () => {
    it("Should display the current number of todo Items", () => {
      cy
        .createTodo(TODO_ITEM_ONE)
        .get(".todo-count").contains("1 item left")
        .createTodo(TODO_ITEM_TWO)
        .get(".todo-count").contains("2 items left")
    })
  })

  context("Clear completed button", () => {
    beforeEach(() => {
      cy.createDefaultTodos().as("todos")
    })

    it("should remove completed items when clicked", () => {
      cy
        .get("@todos").eq(1).find(".toggle").check()
        .get(".clear-completed").click()
        .get("@todos").should("have.length", 2)
        .get("@todos").eq(0).should("contain", TODO_ITEM_ONE)
        .get("@todos").eq(1).should("contain", TODO_ITEM_THREE)
    })

    it("should be hidden when there are no items that are completed", () => {
      cy
        .get("@todos").eq(1).find(".toggle").check()
        .get(".clear-completed").should("be.visible").click()
        .get(".clear-completed").should("not.exist")
    })

    it("should be hidden when there are no items that are completed", () => {
      cy
        .get("@todos").eq(1).find(".toggle").check()
        .get(".clear-completed").should("be.visible").click()
        .get(".clear-completed").should("not.exist")
    })

  })


  context("Persistence", () => {
    it("should persist its data", () => {
      function testState() {
        cy
          .get("@firstTodo").should("contain", TODO_ITEM_ONE).and("have.class", "completed")
          .get("@secondTodo").should("contain", TODO_ITEM_TWO).and("not.have.class", "completed")
      }

      cy
        .createTodo(TODO_ITEM_ONE).as("firstTodo")
        .createTodo(TODO_ITEM_TWO).as("secondTodo")
        .get("@firstTodo").find(".toggle").check()

        .then(testState)

        .reload()

        .then(testState)
    })
  })

  context("Routing", () => {
    beforeEach(() => {
      cy.createDefaultTodos().as("todos")
    })

    it("should allow me to display active items", () => {
      cy
        .get("@todos").eq(1).find(".toggle").check()
        .get(".filters").contains("Active").click()
        .get(".filters").contains("Completed").click()
        .get("@todos").should("have.length", 1)
        .go("back")
        .get("@todos").should("have.length", 2)
        .go("back")
        .get("@todos").should("have.length", 3)
    })

    it("should allow me to display all items", () => {
      cy
        .get("@todos").eq(1).find(".toggle").check()
        .get(".filters").contains("Active").click()
        .get(".filters").contains("Completed").click()
        .get(".filters").contains("All").click()
        .get("@todos").should("have.length", 3)
    })

    it("should highlight the currently applied filter", () => {
      cy
        .get(".filters").within(() => {
          cy.contains("All").should("have.class", "selected")
          cy.contains("Active").click().should("have.class", "selected")
          cy.contains("Completed").click().should("have.class", "selected")
        })
    })
  })
})