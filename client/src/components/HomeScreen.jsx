import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap'

function HomeScreen () {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInstalledApps()
  }, [])

  const fetchInstalledApps = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/apps/installed')
      if (!response.ok) {
        throw new Error('Failed to fetch installed apps')
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

  const getAppUrl = (app) => {
    const scope = app.name.split('/')[0].replace('@', '')
    const appName = app.name.split('/')[1]
    return `/apps/${scope}/${appName}/`
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
      <h1 className='mb-4'>Installed Apps</h1>
      {apps.length === 0
        ? (
          <Alert variant='info'>
            No apps installed. Visit the App Store to install apps.
          </Alert>
          )
        : (
          <Row>
            {apps.map((app) => {
              const appUrl = getAppUrl(app)
              const iconUrl = app.config?.icon
                ? `${appUrl}${app.config.icon}`
                : null

              return (
                <Col key={app.name} xs={6} sm={4} md={3} lg={2} className='mb-4'>
                  <Card
                    as='a'
                    href={appUrl}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                    className='h-100'
                  >
                    <Card.Body className='text-center'>
                      {iconUrl
                        ? (
                          <img
                            src={iconUrl}
                            alt={app.config.displayName || app.name}
                            style={{ width: '64px', height: '64px', marginBottom: '10px' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          )
                        : (
                          <div
                            style={{
                              width: '64px',
                              height: '64px',
                              margin: '0 auto 10px',
                              backgroundColor: '#6c757d',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '24px'
                            }}
                          >
                            {app.config.displayName?.[0] || app.name[1]?.toUpperCase() || '?'}
                          </div>
                          )}
                      <Card.Title style={{ fontSize: '0.9rem', color: '#000' }}>
                        {app.config.displayName || app.name}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
          )}
    </Container>
  )
}

export default HomeScreen
