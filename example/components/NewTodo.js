import React, { PureComponent } from 'react'

export default class NewTodo extends PureComponent {
  state = {
    title: '',
  }

  submitTodo = e => {
    e.preventDefault()
    this.props.onSubmit({ title: this.state.title, done: false })
    this.setState({ title: '' })
  }

  render() {
    const { adding } = this.props
    return (
      <form className='new-todo' onSubmit={this.submitTodo} disabled={adding}>
        <input
          placeholder='What to do ma friend?'
          value={this.state.title}
          type='text'
          onChange={e => this.setState({ title: e.target.value })}
        />
      </form>
    )
  }
}
