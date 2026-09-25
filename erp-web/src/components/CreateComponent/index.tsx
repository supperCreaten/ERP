export default function createComponent (Component: any, props: any = {}) {
  return (
    <Component {...props} />
  )
}
