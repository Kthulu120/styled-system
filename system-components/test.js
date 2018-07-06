import styled, { css as scCSS, isStyledComponent } from 'styled-components'
import {
  __DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS
} from 'styled-components'
import { propTypes } from 'styled-system'
import React from 'react'
import { create as render } from 'react-test-renderer'
import { isDOMComponent, isCompositeComponent } from 'react-dom/test-utils'
import system from './src'
// import emotion from './src/emotion'

// 😎
const { StyleSheet } = __DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS

const getCSS = () => StyleSheet.instance.toReactElements()
  .map(el => el.props.dangerouslySetInnerHTML.__html)
  .join('')

afterEach(() => { StyleSheet.reset() })

describe('system-components', () => {
  test('returns a React component', () => {
    const Box = system()
    const box = render(<Box />).getInstance()
    expect(isCompositeComponent(box)).toBe(true)
  })

  test('returns a styled-component', () => {
    const Box = system()
    expect(typeof Box).toBe('function')
    expect(typeof Box.styledComponentId).toBe('string')
    // t.true(isStyledComponent(Box)) // not yet published
  })

  test('Adds defaultProps', () => {
    const Box = system({
      p: 2,
      bg: 'tomato'
    })
    expect(Box.defaultProps).toEqual({
      p: 2,
      bg: 'tomato'
    })
  })

  test('adds propTypes', () => {
    const Box = system({
      p: 2,
      bg: 'tomato'
    })
    expect(Box.propTypes).toEqual({
      ...propTypes.space,
      ...propTypes.color,
    })
  })

  test('adds styled-system functions based on default props', () => {
    const Box = system({
      p: 3,
      bg: 'tomato'
    })
    const json = render(<Box />).toJSON()
    const css = getCSS()
    expect(css).toMatch(/padding:16px/)
    expect(css).toMatch(/background-color:tomato/)
  })

  test('accepts system key arguments', () => {
    const Box = system('space', 'color')
    expect(typeof Box.propTypes.m).toBe('function')
    expect(typeof Box.propTypes.color).toBe('function')
    expect(typeof Box.propTypes.bg).toBe('function')
  })

  test('ignores nonexistant function keys', () => {
    const Box = system('foo', 'bar')
    expect(Box.propsTypes).toBe(undefined)
  })

  test('accepts custom function arguments', () => {
    const big = props => props.big ? { padding: '64px' } : null
    const Box = system(big)
    const json = render(<Box big />).toJSON()
    const css = getCSS()
    expect(css).toMatch(/padding:64px/)
  })

  test('removes styled-system props from underlying DOM element', () => {
    const Box = system({
      color: 'blue'
    })
    const json = render(<Box />).toJSON()
    expect(json.props.color).toBe(undefined)
    expect(typeof json.props.className).toBe('string')
  })

  test('removes blacklist props from underlying DOM element', () => {
    const Box = system({
      blacklist: ['customProp']
    })
    const json = render(<Box customProp='hi' />).toJSON()
    expect(json.props.customProp).toBe(undefined)
  })

  test('accepts an `is` prop to change the underlying DOM element', () => {
    const Box = system({
      p: 2
    })
    const json = render(<Box is='h1' />).toJSON()
    expect(json.type).toBe('h1')
  })

  test('accepts a style function argument', () => {
    const Box = system(props => `color:${props.color};`)
    const json = render(<Box color='magenta' />).toJSON()
    const css = getCSS()
    expect(css).toMatch(/color:magenta/)
  })

  test('accepts theme as a default prop', () => {
    const theme = {
      colors: {
        blue: '#0af'
      }
    }
    const Box = system({ color: 'blue', theme })
    const json = render(<Box />).toJSON()
    const css = getCSS()
    expect(css).toMatch(/color:#0af/)
  })

  test('passes css string arguments', () => {
    const Box = system('color:cyan;')
    const json = render(<Box />).toJSON()
    const css = getCSS()
    expect(css).toMatch(/color:cyan;/)
  })

  test('works with the styled-component `css` helper', () => {
    const Box = system(scCSS`
      color: ${props => props.color};
    `)
    const json = render(<Box color='yellow' />).toJSON()
    const css = getCSS()
    expect(css).toMatch(/color:yellow/)
  })

  test('defaultProps are passed to extended components', () => {
    const Box = system({
      p: 2,
      bg: 'tomato'
    }, 'space', 'color')
    const ExtendedBox = system({ is: Box })
    const json = render(<ExtendedBox />).toJSON()
    const css = getCSS()
    expect(css).toMatch(/background-color:tomato/)
  })

  /*
  test('emotion returns a React component', () => {
    const Box = emotion()
    const box = render(<Box />).getInstance()
    t.true(isCompositeComponent(box))
  })

  test('emotion innerRef', () => {
    const Box = emotion()
    let ref = 'fooo'
    const box = render(<Box innerRef={(node) => { ref = node }} />).getInstance()
    t.true(isCompositeComponent(box))
    t.not(ref, 'fooo')
  })
  */

  test('accepts a css prop for custom styling', () => {
    const Box = system({})
    const json = render(<Box css='color:tomato;' />).toJSON()
    const css = getCSS()
    expect(css).toMatch(/color:tomato/)
  })

  test('merges defaultProps from `is` prop component', () => {
    const Base = system({ p: 3 })
    const Ext = system({ is: Base })
    const json = render(<Ext />).toJSON()
    const css = getCSS()
    expect(Ext.defaultProps.p).toBe(3)
    expect(css).toMatch(/padding:16px/)
  })

  test('extends components with the is prop and passes is prop to clean-tag', () => {
    const Base = system({ p: 3 })
    const Ext = system({ is: Base }, 'color')
    const json = render(<Ext is='footer' p={3} bg='tomato' />).toJSON()
    const css = getCSS()
    expect(json.type).toBe('footer')
    expect(css).toMatch(/background-color:tomato/)
    expect(css).toMatch(/padding:16px/)
  })

  test('extends a non-system component and does not accept an is prop', () => {
    const Base = props => <div className='Base' {...props} />
    const Ext = system({ is: Base }, 'color')
    const json = render(
      <Ext is='footer' color='tomato' />
    ).toJSON()
    const css = getCSS()
    expect(json.type).toBe('div')
    expect(css).toMatch(/color:tomato/)
  })

  test('passes innerRef to underlying element', () => {
    const Base = system({ p: 3 })
    let foo = 'hello'
    const instance = render(
      <Base innerRef={ref => foo = ref} />
    ).getInstance()
    expect(isCompositeComponent(instance)).toBe(true)
    expect(foo).not.toBe('hello')
  })
})
