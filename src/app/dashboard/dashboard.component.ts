import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import party from "party-js"
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  logOutDiv: boolean = false
  deleteSpinnerDiv:boolean=false
  fundTransferSuccessMsg: string = ''
  fundTransferErrorMsg: string = ''
  deleteConfirm: boolean = false

  user: string = ''
  currentAcno: Number = 0
  balance: Number = 0
  acno: any = '';
  depositForm = this.fb.group({
    amount: ['', [Validators.required, Validators.pattern('[0-9]*')]],

  })
  depositMsg: string = ''
  fundTransferForm = this.fb.group({
    toAcno: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    pswd: ['', [Validators.required, Validators.pattern('[0-9a-zA-Z]*')]],
    amount: ['', [Validators.required, Validators.pattern('[0-9]*')]]

  })
  constructor(private api: ApiService, private fb: FormBuilder, private router: Router) {

  }
  ngOnInit() {
    if (!localStorage.getItem("token")) {
      alert("Please login")
      this.router.navigateByUrl('')
    }
    if (localStorage.getItem("username")) {
      this.user = localStorage.getItem("username") || ''
    }

  }

  getBalance() {
    if (localStorage.getItem("currentAcno")) {
      this.currentAcno = JSON.parse(localStorage.getItem("currentAcno") || '')
      this.api.getBalance(this.currentAcno)
        .subscribe((result: any) => {
          this.balance = result.balance
        })
    }
  }
  //deposit
  deposit() {
    if (this.depositForm.valid) {
      let amount = this.depositForm.value.amount
      this.currentAcno = JSON.parse(localStorage.getItem("currentAcno") || '')
      this.api.deposit(this.currentAcno, amount)
        .subscribe(
          //success
          (result: any) => {
            this.depositMsg = result.message
            setTimeout(() => {
              this.depositForm.reset()
              this.depositMsg = ''
            }, 5000)
          },
          //error
          (result: any) => {
            this.depositMsg = result.console.error.message

          })
    }
    else {
      alert('Invalid Form')
    }
  }
  //showconfetti
  showconfetti(source: any) {
    party.confetti(source);
  }

  //transfer
  transfer() {
    if (this.fundTransferForm.valid) {
      let toAcno = this.fundTransferForm.value.toAcno
      let pswd = this.fundTransferForm.value.pswd
      let amount = this.fundTransferForm.value.amount

      //make api call for fundTransfer
      this.api.fundTransfer(toAcno, pswd, amount)
        .subscribe(
          //success
          (result: any) => {
            this.fundTransferSuccessMsg = result.message
          },
          //clienterroe
          (result: any) => {
            this.fundTransferErrorMsg = result.error.message
          }
        )


    }
    else {
      alert('Invalid Form')
    }
  }
  //clearFundTransferForm
  clearFundTransferForm() {
    this.fundTransferErrorMsg = ""
    this.fundTransferSuccessMsg = ""
    this.fundTransferForm.reset()
  }

  //logout
  logOut() {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("currentAcno")
    this.logOutDiv = true

    setTimeout(() => {
      this.router.navigateByUrl('')
      this.logOutDiv = false
    }, 5000);
  }

  //deleteAccountFromNavBar
  deleteAccountFromNavBar() {
    this.acno = localStorage.getItem("currentAcno")
    this.deleteConfirm = true
  }

  onCancel() {
    this.acno = ''
    this.deleteConfirm = false
  }
  onDelete(event: any) {
    let deleteAcno = JSON.parse(event)
    this.api.deleteAccount(deleteAcno)
      .subscribe(
        (result: any) => {
          this.acno=''
          localStorage.removeItem("token")
          localStorage.removeItem("username")
          localStorage.removeItem("currentAcno")
          this.deleteSpinnerDiv=true

          setTimeout(() => {
            //navigate to login
            this.router.navigateByUrl('')
            this.deleteSpinnerDiv = false
          }, 4000);
        },
        (result:any)=>{
          alert(result.error.message)
        }
      )
  }
}
