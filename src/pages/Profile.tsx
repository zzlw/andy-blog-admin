import { useEffect } from 'react'
import { Button, Card, Col, Form, Input, Row, message } from 'antd'
import { updatePassword, updateProfile } from '@/apis/auth'
import { UploadImage } from '@/components/UploadImage'
import { useProfile } from '@/contexts/profile'

export const Profile = () => {
  const { profile, refresh } = useProfile()
  const [infoForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    if (profile) {
      infoForm.setFieldsValue({
        avatar: profile.avatar,
        email: profile.email,
        description: profile.description,
      })
    }
  }, [profile, infoForm])

  const submitInfo = async () => {
    const values = await infoForm.validateFields()
    await updateProfile(values)
    message.success('更新资料成功')
    refresh()
  }

  const submitPassword = async () => {
    const values = await passwordForm.validateFields()
    await updatePassword(values.old_password, values.new_password)
    message.success('修改密码成功')
    passwordForm.resetFields()
  }

  return (
    <Row gutter={24}>
      <Col span={12}>
        <Card title={`个人资料（${profile?.name ?? ''}）`}>
          <Form form={infoForm} layout="vertical">
            <Form.Item name="avatar" label="头像">
              <UploadImage width={120} height={120} />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ type: 'email', message: '邮箱格式不正确' }]}
            >
              <Input placeholder="联系邮箱" />
            </Form.Item>
            <Form.Item name="description" label="简介">
              <Input.TextArea maxLength={255} rows={3} placeholder="个人简介" />
            </Form.Item>
            <Button type="primary" onClick={submitInfo}>
              保存资料
            </Button>
          </Form>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="修改密码">
          <Form form={passwordForm} layout="vertical">
            <Form.Item
              name="old_password"
              label="原密码"
              rules={[{ required: true, message: '请输入原密码' }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item
              name="new_password"
              label="新密码"
              rules={[
                {
                  required: true,
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)\S{6,32}$/,
                  message: '密码需 6~32 位且同时包含字母和数字',
                },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="确认新密码"
              dependencies={['new_password']}
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    value === getFieldValue('new_password')
                      ? Promise.resolve()
                      : Promise.reject(new Error('两次输入的密码不一致')),
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Button type="primary" onClick={submitPassword}>
              修改密码
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}
