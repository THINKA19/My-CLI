import type { SearchText } from '../../i18n/types'

export const search = {
  button: {
    buttonText: 'Tìm kiếm',
    buttonAriaLabel: 'Tìm kiếm tài liệu',
  },
  modal: {
    noResultsText: 'Không tìm thấy kết quả',
    resetButtonTitle: 'Xóa tìm kiếm',
    displayDetails: 'Hiển thị danh sách chi tiết',
    backButtonTitle: 'Quay lại tìm kiếm',
    footer: {
      selectText: 'Chọn',
      navigateText: 'Di chuyển',
      closeText: 'Đóng',
    },
  },
} satisfies SearchText
