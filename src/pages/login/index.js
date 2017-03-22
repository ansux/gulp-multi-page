avalon.define({
  $id: 'login',
  userId: '',
  password: '',
  submit() {
    if (!this.userId) {
      document.getElementById('userId').focus()
      return
    }
    if (!this.password) {
      document.getElementById('password').focus()
      return
    }
    axios.post('/login', {
      userId: this.userId,
      password: this.password
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
  }
})