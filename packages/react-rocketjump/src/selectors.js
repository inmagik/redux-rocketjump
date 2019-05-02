// Barebone selectors for barebone reducer
export default function makeSelectors() {
  const getData = ({ data }) => data
  const isLoading = ({ loading }) => loading
  const getError = ({ error }) => error

  return { getData, isLoading, getError }
}
