class jeopardyShow {
   constructor(el, 
     options={}) {
      
      this.useCategoryIds = [76 ,129 , 4483, 176, 218, 1550]; 
  
      this.categories = [];
      this.clues = {};
     
      this.currentClue = null;
      this.score = 0;
      
      this.boardElement = el.querySelector(".board");
      this.scoreCountElement = el.querySelector(".score-1");
      this.formElement = el.querySelector("form");
      this.inputElement = el.querySelector("input[name=user-answer]");
      this.modalElement = el.querySelector(".card-modal");
      this.clueTextElement = el.querySelector(".clue");
      this.resultElement = el.querySelector(".result");
      this.resultTextElement = el.querySelector(".result_correct-answer-text");
      this.successTextElement = el.querySelector(".result_success");
      this.failTextElement = el.querySelector(".result_fail");
   }

   initGame() {
      
      this.boardElement.addEventListener("click", event => {
         if (event.target.dataset.clueId) {
            this.handleClueClick(event);
         }
      });
      this.formElement.addEventListener("submit", event => {
         this.handleFormSubmit(event);
      });
      
      this.updateScore(0);
      this.fetchCategories();
   }
   

   fetchCategories() {      
      const categories = this.useCategoryIds.map(category_id => {
         return new Promise((resolve, reject) => {
            fetch(`https://jservice.io/api/category?id=${category_id}`)
               .then(response => response.json()).then(data => {
                  resolve(data);
               });
         });
      });
      
      Promise.all(categories).then(results => {
         
         results.forEach((result, categoryIndex) => {
            
            let category = {
               title: result.title,
               clues: []
            }
            
            let clues = shuffle(result.clues).splice(0,5).forEach((clue, index) => {
               console.log(clue)
               
               let clueId = categoryIndex + "-" + index;
               category.clues.push(clueId);
               
           
               this.clues[clueId] = {
                  question: clue.question,
                  answer: clue.answer,
                  value: (index + 1) * 100
               };
            })
            
        
            this.categories.push(category);
         });
         
        
         this.categories.forEach((c) => {
            this.renderCategory(c);
         });
      });
   }

   renderCategory(category) {      
      let column = document.createElement("div");
      column.classList.add("column");
      column.innerHTML = (
         `<header>${category.title}</header>
         <ul>
         </ul>`
      ).trim();
      
      let ul = column.querySelector("ul");
      category.clues.forEach(clueId => {
         let clue = this.clues[clueId];
         ul.innerHTML += `<li><button data-clue-id=${clueId}>${clue.value}</button></li>`
      })
      
      
      this.boardElement.appendChild(column);
   }

   updateScore(change) {
      this.score += change;
      this.scoreCountElement.textContent = this.score;
   }

   handleClueClick(event) {
      let clue = this.clues[event.target.dataset.clueId];

      event.target.classList.add("used");
      
      this.inputElement.value = "";
     
      this.currentClue = clue;

      this.clueTextElement.textContent = this.currentClue.question;
      this.resultTextElement.textContent = this.currentClue.answer;

      this.modalElement.classList.remove("showing-result");
      
      this.modalElement.classList.add("visible");
      this.inputElement.focus();
   }

   handleFormSubmit(event) {
      event.preventDefault();
      
      var isCorrect = this.correctAnswer(this.inputElement.value) === this.correctAnswer(this.currentClue.answer);
      if (isCorrect) {
         this.updateScore(this.currentClue.value);
      }
      
      this.revealAnswer(isCorrect);
   }
   
   correctAnswer(input="") {
      let newAnswer = input.toLowerCase();
    
      return newAnswer;
   }
   
   
   revealAnswer(isCorrect) {
      
      this.successTextElement.style.display = isCorrect ? "block" : "none";
      this.failTextElement.style.display = !isCorrect ? "block" : "none";
      
      this.modalElement.classList.add("showing-result");
      
      setTimeout(() => {
         this.modalElement.classList.remove("visible");
      }, 2500);
   }
   
}


function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
} 

const game = new jeopardyShow( document.querySelector(".game"), {});
game.initGame();

