import styles from './HelloWorld.module.scss'

export function HelloWorld() {
  return (
    <div className="p-4 rounded-lg">
      <p>TEST</p>
      <h1 className="text-2xl font-bold text-blue-500">Hello</h1>
      <p className={styles.specialStyle}>Este es un componente de prueba con Tailwind CSS.</p>
    </div>
  )
}
