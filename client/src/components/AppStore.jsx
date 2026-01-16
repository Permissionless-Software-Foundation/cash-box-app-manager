import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap'

function AppStore () {
  const [apps, setApps] = useState([])
  const [installedApps, setInstalledApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchApps()
    fetchInstalledApps()
  }, [])

  const fetchApps = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/apps/discover')
      if (!response.ok) {
        throw new Error('Failed to fetch apps')
      }
      const data = await response.json()
      setApps(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchInstalledApps = async () => {
    try {
      const response = await fetch('/api/apps/installed')
      if (!response.ok) {
        throw new Error('Failed to fetch installed apps')
      }
      const data = await response.json()
      setInstalledApps(data.map(app => app.name))
    } catch (err) {
      console.error('Error fetching installed apps:', err)
    }
  }

  const installApp = async (app) => {
    const scope = app.name.split('/')[0].replace('@', '')
    const appName = app.name.split('/')[1]

    try {
      setInstalling({ ...installing, [app.name]: true })
      const response = await fetch(`/api/apps/install/${scope}/${appName}`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Installation failed')
      }

      const result = await response.json()
      alert(result.message || 'App installed successfully!')
      await fetchInstalledApps()
    } catch (err) {
      alert(`Installation failed: ${err.message}`)
    } finally {
      setInstalling({ ...installing, [app.name]: false })
    }
  }

  const uninstallApp = async (app) => {
    const scope = app.name.split('/')[0].replace('@', '')
    const appName = app.name.split('/')[1]

    try {
      setInstalling({ ...installing, [app.name]: true })
      const response = await fetch(`/api/apps/uninstall/${scope}/${appName}`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Uninstallation failed')
      }

      const result = await response.json()
      alert(result.message || 'App uninstalled successfully!')
      await fetchInstalledApps()
    } catch (err) {
      alert(`Uninstallation failed: ${err.message}`)
    } finally {
      setInstalling({ ...installing, [app.name]: false })
    }
  }

  const isInstalled = (appName) => {
    return installedApps.includes(appName)
  }

  if (loading) {
    return (
      <Container className='mt-4'>
        <div className='text-center'>
          <Spinner animation='border' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </Spinner>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className='mt-4'>
        <Alert variant='danger'>{error}</Alert>
      </Container>
    )
  }

  return (
    <Container className='mt-4'>
      <h1 className='mb-4'>App Store</h1>
      {apps.length === 0
        ? (
          <Alert variant='info'>No apps found in the registry.</Alert>
          )
        : (
          <Row>
            {apps.map((app) => {
              const installed = isInstalled(app.name)
              const isInstalling = installing[app.name]

              return (
                <Col key={app.name} xs={12} sm={6} md={4} lg={3} className='mb-4'>
                  <Card className='h-100'>
                    <Card.Body>
                      <Card.Title>{app.name}</Card.Title>
                      <Card.Text>{app.description || 'No description available'}</Card.Text>
                      <Badge bg='secondary' className='mb-2'>
                        v{app.version}
                      </Badge>
                      {installed && (
                        <Badge bg='success' className='ms-2 mb-2'>
                  Installed
                      </Badge>
                      )}
                    </Card.Body>
                    <Card.Footer>
                      {installed
                        ? (
                  <Button
                          variant='danger'
                          size='sm'
                          onClick={() => uninstallApp(app)}
                          disabled={isInstalling}
                          className='w-100'
                        >
                          {isInstalling
                            ? (
                              <>
                                <Spinner
                                  as='span'
                                  animation='border'
                                  size='sm'
                                  role='status'
                                  aria-hidden='true'
                                  className='me-2'
                                />
                                Uninstalling...
                              </>
                              )
                            : (
                                'Uninstall'
                              )}
                        </Button>
                          )
                        : (
                  <Button
                          variant='primary'
                          size='sm'
                          onClick={() => installApp(app)}
                          disabled={isInstalling}
                          className='w-100'
                        >
                          {isInstalling
                            ? (
                              <>
                                <Spinner
                                  as='span'
                                  animation='border'
                                  size='sm'
                                  role='status'
                                  aria-hidden='true'
                                  className='me-2'
                                />
                                Installing...
                              </>
                              )
                            : (
                                'Install'
                              )}
                        </Button>
                          )}
                    </Card.Footer>
                  </Card>
                </Col>
              )
            })}
          </Row>
          )}
    </Container>
  )
}

export default AppStore
